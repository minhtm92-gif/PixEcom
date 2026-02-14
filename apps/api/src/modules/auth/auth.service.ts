import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Register ──────────────────────────────────────

  async register(dto: RegisterDto, res: Response) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        displayName: dto.displayName,
      },
    });

    const tokens = await this.generateTokens(user);
    this.setRefreshCookie(res, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      user: this.sanitizeUser(user),
    };
  }

  // ── Login ─────────────────────────────────────────

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    this.setRefreshCookie(res, tokens.refreshToken);

    // Fetch user's first workspace for auto-selection
    const workspace = await this.getFirstWorkspace(user.id);

    return {
      accessToken: tokens.accessToken,
      user: this.sanitizeUser(user),
      ...(workspace && { workspace }),
    };
  }

  // ── Refresh ───────────────────────────────────────

  async refresh(oldToken: string | undefined, res: Response) {
    if (!oldToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: oldToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up the expired token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (!storedToken.user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    // Rotate: delete old token, create new pair
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const tokens = await this.generateTokens(storedToken.user);
    this.setRefreshCookie(res, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      user: this.sanitizeUser(storedToken.user),
    };
  }

  // ── Logout ────────────────────────────────────────

  async logout(userId: string, res: Response) {
    // Delete all refresh tokens for this user
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Clear the cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  // ── Get Profile ───────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  // ── Private Helpers ───────────────────────────────

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      isSuperadmin: user.isSuperadmin,
    };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshTokenValue = uuidv4();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshTokenValue,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_EXPIRY_MS,
    });
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  private async getFirstWorkspace(userId: string) {
    // Try finding workspace via membership first
    const membership = await this.prisma.membership.findFirst({
      where: { userId, isActive: true },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (membership?.workspace) {
      return membership.workspace;
    }

    // DEV_MODE fallback: use first workspace in DB
    const devMode = this.config.get<string>('DEV_MODE', 'false') === 'true';
    if (devMode) {
      const firstWs = await this.prisma.workspace.findFirst({
        select: { id: true, name: true, slug: true },
        orderBy: { createdAt: 'asc' },
      });
      return firstWs || null;
    }

    return null;
  }
}
