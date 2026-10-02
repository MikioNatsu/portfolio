import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { AuthUser, LoginResponse } from '@natsu/types';
import { PrismaService } from '../prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    // Always run a comparison so response time does not reveal whether the
    // email exists (basic user-enumeration protection).
    const hash =
      user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin';
    const valid = await bcrypt.compare(dto.password, hash);

    if (!user || !valid) {
      this.logger.warn(`Failed login attempt for ${dto.email}`);
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const expiresIn = this.config.get<string>('jwt.expiresIn') ?? '7d';
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        lastLoginAt: new Date().toISOString(),
      },
    };
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        lastLoginAt: true,
      },
    });

    if (!user) throw new UnauthorizedException('This session is no longer valid.');

    return {
      ...user,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    };
  }

  /** Stateless logout — the client discards the token, the cookie is cleared. */
  logout(): { ok: boolean } {
    return { ok: true };
  }
}
