import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { RoleCode } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AuthUser, JwtPayload } from './types/jwt-payload.type.js';
import { LoginDto } from './dto/login.dto.js';
import type { VerifyOtpDto } from './dto/otp.dto.js';
import {
  normalizePhone,
  phoneToSyntheticEmail,
} from '../../common/utils/phone.util.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const authUser = this.toAuthUser(user);
    const tokens = await this.issueTokens(authUser);

    return { ...tokens, user: authUser };
  }

  async requestOtp(rawPhone: string) {
    let phone: string;
    try {
      phone = normalizePhone(rawPhone);
    } catch {
      throw new BadRequestException('Invalid phone number');
    }

    const recent = await this.prisma.otpChallenge.count({
      where: {
        phone,
        purpose: 'login',
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
    });
    if (recent >= 3) {
      throw new BadRequestException('Too many OTP requests. Try again shortly.');
    }

    await this.prisma.otpChallenge.updateMany({
      where: { phone, purpose: 'login', consumedAt: null },
      data: { consumedAt: new Date() },
    });

    const code = '123456';
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpChallenge.create({
      data: {
        phone,
        codeHash,
        purpose: 'login',
        expiresAt,
      },
    });

    this.logger.log(`OTP for ${phone}: ${code}`);

    const isDev = this.config.get<string>('NODE_ENV') !== 'production';
    return {
      ok: true,
      phone,
      expiresInSec: 300,
      ...(isDev ? { devCode: code } : {}),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    let phone: string;
    try {
      phone = normalizePhone(dto.phone);
    } catch {
      throw new BadRequestException('Invalid phone number');
    }

    const challenge = await this.prisma.otpChallenge.findFirst({
      where: {
        phone,
        purpose: 'login',
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge || challenge.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired or not found');
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      throw new UnauthorizedException('Too many invalid attempts');
    }

    const ok = await bcrypt.compare(dto.code.trim(), challenge.codeHash);
    if (!ok) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });

    const authUser = await this.ensureCustomerUser(phone, dto);
    await this.prisma.user.update({
      where: { id: authUser.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokens(authUser);
    return { ...tokens, user: authUser };
  }

  private async ensureCustomerUser(
    phone: string,
    dto: VerifyOtpDto,
  ): Promise<AuthUser> {
    const email = phoneToSyntheticEmail(phone);
    const role = await this.prisma.role.findUnique({
      where: { code: RoleCode.CUSTOMER },
    });
    if (!role) throw new BadRequestException('CUSTOMER role is not seeded');

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone }, { email }],
      },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
        customer: true,
      },
    });

    const firstName = dto.firstName.trim();
    const lastName = dto.lastName.trim();

    if (!user) {
      const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phone,
          roleId: role.id,
          status: 'ACTIVE',
        },
        include: {
          role: {
            include: {
              rolePermissions: { include: { permission: true } },
            },
          },
          customer: true,
        },
      });
    } else if (user.role.code === RoleCode.EMPLOYEE || user.role.code === RoleCode.ADMIN) {
      throw new ForbiddenException('Use staff login for this account');
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { firstName, lastName, phone: user.phone || phone },
        include: {
          role: {
            include: {
              rolePermissions: { include: { permission: true } },
            },
          },
          customer: true,
        },
      });
    }

    if (!user.customer) {
      const existingByPhone = await this.prisma.customer.findFirst({
        where: { phone },
        orderBy: { createdAt: 'asc' },
      });
      if (existingByPhone) {
        await this.prisma.customer.update({
          where: { id: existingByPhone.id },
          data: {
            userId: user.id,
            phone,
            firstName,
            lastName,
          },
        });
      } else {
        await this.prisma.customer.create({
          data: {
            userId: user.id,
            email: user.email,
            phone,
            firstName,
            lastName,
          },
        });
      }
    } else {
      await this.prisma.customer.update({
        where: { id: user.customer.id },
        data: {
          phone: user.customer.phone || phone,
          firstName,
          lastName,
        },
      });
    }

    const fresh = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    return this.toAuthUser(fresh);
  }

  async refresh(refreshToken: string) {
    const hash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: hash },
      include: {
        user: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.user.status !== 'ACTIVE') {
      throw new ForbiddenException('User is not active');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const authUser = this.toAuthUser(stored.user);
    const tokens = await this.issueTokens(authUser);
    return { ...tokens, user: authUser };
  }

  async logout(refreshToken: string) {
    const hash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { token: hash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException();
    return this.toAuthUser(user);
  }

  private async issueTokens(user: AuthUser) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessExpires =
      this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m';
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpires as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });

    const refreshRaw = randomBytes(48).toString('hex');
    const refreshHash = this.hashToken(refreshRaw);
    const expiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES', '7d');
    const expiresAt = this.parseExpiry(expiresIn);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshHash,
        userId: user.id,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshRaw };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(expiresIn: string): Date {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    const now = Date.now();
    if (!match) return new Date(now + 7 * 24 * 60 * 60 * 1000);
    const n = Number(match[1]);
    const unit = match[2];
    const ms =
      unit === 's'
        ? n * 1000
        : unit === 'm'
          ? n * 60 * 1000
          : unit === 'h'
            ? n * 60 * 60 * 1000
            : n * 24 * 60 * 60 * 1000;
    return new Date(now + ms);
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatarUrl: string | null;
    status: string;
    roleId: string;
    role: {
      code: string;
      rolePermissions: { permission: { code: string } }[];
    };
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      role: user.role.code,
      roleId: user.roleId,
      permissions: user.role.rolePermissions.map((rp) => rp.permission.code),
    };
  }
}
