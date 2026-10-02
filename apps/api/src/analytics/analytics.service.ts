import { Injectable } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import type { AnalyticsSummary, DashboardOverview } from '@natsu/types';
import { PrismaService } from '../prisma/prisma.service';
import { cleanText } from '../common/utils/content.util';
import type { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';

const RANGE_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a single first-party event. Deliberately narrow: no IP, no user
   * agent, no cookies — just what, where and on what kind of device.
   */
  async track(dto: CreateAnalyticsEventDto): Promise<{ ok: boolean }> {
    await this.prisma.analyticsEvent.create({
      data: {
        event: dto.event,
        path: cleanText(dto.path).slice(0, 300),
        projectId: dto.projectId ?? null,
        referrer: dto.referrer ? cleanText(dto.referrer).slice(0, 120) : null,
        sessionId: dto.sessionId ? dto.sessionId.slice(0, 80) : null,
        deviceType: dto.deviceType ?? null,
      },
    });

    return { ok: true };
  }

  async summary(range: string = '30d'): Promise<AnalyticsSummary> {
    const days = RANGE_DAYS[range] ?? 30;
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      views,
      projectViews,
      events,
      messages,
      unreadMessages,
      projects,
      publishedProjects,
      seriesRows,
      projectGroups,
      pathGroups,
      deviceGroups,
      referrerGroups,
      recentEvents,
    ] = await Promise.all([
      this.prisma.analyticsEvent.count({
        where: { event: 'page_view', createdAt: { gte: start } },
      }),
      this.prisma.analyticsEvent.count({
        where: { event: 'project_view', createdAt: { gte: start } },
      }),
      this.prisma.analyticsEvent.count({ where: { createdAt: { gte: start } } }),
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({ where: { read: false } }),
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: ProjectStatus.PUBLISHED } }),
      this.prisma.$queryRaw<Array<{ day: Date; views: bigint; events: bigint }>>`
        SELECT date_trunc('day', "createdAt") AS day,
               COUNT(*) FILTER (WHERE event = 'page_view')::bigint AS views,
               COUNT(*)::bigint AS events
        FROM analytics_events
        WHERE "createdAt" >= ${start}
        GROUP BY day
        ORDER BY day ASC
      `,
      this.prisma.analyticsEvent.groupBy({
        by: ['projectId'],
        where: { event: 'project_view', projectId: { not: null }, createdAt: { gte: start } },
        _count: { projectId: true },
        orderBy: { _count: { projectId: 'desc' } },
        take: 6,
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['path'],
        where: { event: 'page_view', createdAt: { gte: start } },
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 6,
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['deviceType'],
        where: { createdAt: { gte: start } },
        _count: { deviceType: true },
        orderBy: { _count: { deviceType: 'desc' } },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['referrer'],
        where: { referrer: { not: null }, createdAt: { gte: start } },
        _count: { referrer: true },
        orderBy: { _count: { referrer: 'desc' } },
        take: 6,
      }),
      this.prisma.analyticsEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          id: true,
          event: true,
          path: true,
          deviceType: true,
          referrer: true,
          createdAt: true,
        },
      }),
    ]);

    const projectIds = projectGroups
      .map((group) => group.projectId)
      .filter((id): id is string => Boolean(id));

    const projectTitles =
      projectIds.length > 0
        ? await this.prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: { id: true, title: true, slug: true },
          })
        : [];

    const seriesMap = new Map(
      seriesRows.map((row) => [
        row.day.toISOString().slice(0, 10),
        { views: Number(row.views), events: Number(row.events) },
      ]),
    );

    // Fill gaps so the chart never collapses to a single point.
    const series: AnalyticsSummary['series'] = [];
    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const entry = seriesMap.get(date) ?? { views: 0, events: 0 };
      series.push({ date, views: entry.views, events: entry.events });
    }

    return {
      totals: {
        views,
        projectViews,
        events,
        messages,
        unreadMessages,
        projects,
        publishedProjects,
      },
      series,
      topProjects: projectGroups
        .map((group) => {
          const project = projectTitles.find((item) => item.id === group.projectId);
          if (!project) return null;
          return {
            id: project.id,
            title: project.title,
            slug: project.slug,
            views: group._count.projectId,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
      topPaths: pathGroups.map((group) => ({ label: group.path, value: group._count.path })),
      devices: deviceGroups.map((group) => ({
        label: group.deviceType ?? 'unknown',
        value: group._count.deviceType,
      })),
      referrers: referrerGroups.map((group) => ({
        label: group.referrer ?? 'direct',
        value: group._count.referrer,
      })),
      recentEvents: recentEvents.map((event) => ({
        id: event.id,
        event: event.event,
        path: event.path,
        deviceType: event.deviceType,
        referrer: event.referrer,
        createdAt: event.createdAt.toISOString(),
      })),
    };
  }

  /** Everything the dashboard cards need, in one round trip. */
  async overview(): Promise<DashboardOverview> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalProjects,
      published,
      drafts,
      featured,
      totalMessages,
      unread,
      totalViews,
      viewsLast7Days,
      experience,
      skills,
      recentMessages,
      recentEvents,
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: ProjectStatus.PUBLISHED } }),
      this.prisma.project.count({ where: { status: ProjectStatus.DRAFT } }),
      this.prisma.project.count({ where: { featured: true } }),
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({ where: { read: false } }),
      this.prisma.analyticsEvent.count({ where: { event: 'page_view' } }),
      this.prisma.analyticsEvent.count({
        where: { event: 'page_view', createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.experience.count(),
      this.prisma.skill.count(),
      this.prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      this.prisma.analyticsEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          event: true,
          path: true,
          deviceType: true,
          referrer: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      projects: { total: totalProjects, published, drafts, featured },
      messages: { total: totalMessages, unread },
      views: { total: totalViews, last7Days: viewsLast7Days },
      experience,
      skills,
      recentMessages: recentMessages.map((message) => ({
        id: message.id,
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message,
        status: message.status,
        read: message.read,
        createdAt: message.createdAt.toISOString(),
      })),
      recentEvents: recentEvents.map((event) => ({
        id: event.id,
        event: event.event,
        path: event.path,
        deviceType: event.deviceType,
        referrer: event.referrer,
        createdAt: event.createdAt.toISOString(),
      })),
    };
  }
}
