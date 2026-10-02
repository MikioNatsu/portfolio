import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ContactStatus, Prisma } from '@prisma/client';
import type { ContactSubmissionResult } from '@natsu/types';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginated, resolvePagination } from '../common/dto/pagination.dto';
import { cleanText, hashIp } from '../common/utils/content.util';
import { MailService } from './mail.service';
import type { CreateContactDto } from './dto/create-contact.dto';
import type { QueryMessagesDto } from './dto/query-messages.dto';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async submit(
    dto: CreateContactDto,
    context: { ip?: string; userAgent?: string },
  ): Promise<ContactSubmissionResult> {
    // Honeypot tripped: behave exactly like success so bots learn nothing.
    if (dto.company && dto.company.trim().length > 0) {
      this.logger.warn('Contact submission rejected by honeypot.');
      return {
        id: 'ignored',
        received: true,
        emailSent: false,
        message: 'Thanks — your message has been received.',
      };
    }

    const message = await this.prisma.contactMessage.create({
      data: {
        name: cleanText(dto.name),
        email: dto.email.toLowerCase().trim(),
        subject: cleanText(dto.subject),
        message: cleanText(dto.message),
        ipHash: hashIp(context.ip, process.env.JWT_SECRET ?? 'natsu'),
        userAgent: context.userAgent?.slice(0, 300) ?? null,
      },
    });

    const payload = {
      name: message.name,
      email: message.email,
      subject: message.subject,
      message: message.message,
    };

    // Email failures must never fail the request — the message is already saved.
    const notified = await this.mail.sendContactNotification(payload);
    await this.mail.sendAutoReply(payload);

    return {
      id: message.id,
      received: true,
      emailSent: notified,
      message: 'Thanks — your message has been received.',
    };
  }

  async list(query: QueryMessagesDto) {
    const { skip, take, page, pageSize } = resolvePagination(query);

    const where: Prisma.ContactMessageWhereInput = {};
    if (query.status) where.status = query.status as ContactStatus;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { subject: { contains: query.search, mode: 'insensitive' } },
        { message: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return buildPaginated(items, total, page, pageSize);
  }

  async markRead(id: string, read: boolean) {
    const existing = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('That message could not be found.');

    return this.prisma.contactMessage.update({
      where: { id },
      data: { read, status: read ? ContactStatus.READ : ContactStatus.NEW },
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.contactMessage.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('That message could not be found.');
    await this.prisma.contactMessage.delete({ where: { id } });
  }

  countUnread(): Promise<number> {
    return this.prisma.contactMessage.count({ where: { read: false } });
  }
}
