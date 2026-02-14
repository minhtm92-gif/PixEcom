import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const devMode = this.config.get<string>('DEV_MODE', 'false') === 'true';
    const request = context.switchToHttp().getRequest();

    // Try normal JWT auth
    try {
      const result = await super.canActivate(context);
      if (result) return true;
    } catch (err) {
      // In dev mode, fallback to admin user
      if (devMode) {
        const admin = await this.prisma.user.findFirst({
          where: { isSuperadmin: true, isActive: true },
        });
        if (admin) {
          request.user = admin;
          return true;
        }
      }
      throw new UnauthorizedException('Invalid or missing authentication token');
    }

    return false;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
