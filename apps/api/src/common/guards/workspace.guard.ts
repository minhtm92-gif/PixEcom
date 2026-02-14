import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const devMode = this.config.get<string>('DEV_MODE', 'false') === 'true';

    let workspaceId = request.headers['x-workspace-id'];

    // DEV_MODE fallback: use first workspace
    if (!workspaceId && devMode) {
      const firstWs = await this.prisma.workspace.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (firstWs) {
        workspaceId = firstWs.id;
      }
    }

    if (!workspaceId) {
      throw new BadRequestException('X-Workspace-Id header is required');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(workspaceId)) {
      throw new BadRequestException('X-Workspace-Id must be a valid UUID');
    }

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const user = request.user;

    // Superadmin bypasses membership check
    if (user?.isSuperadmin) {
      request.workspace = workspace;
      request.membership = null;
      return true;
    }

    if (user) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          uq_membership_ws_user: {
            workspaceId: workspace.id,
            userId: user.id,
          },
        },
      });

      if (!membership || !membership.isActive) {
        if (devMode) {
          request.workspace = workspace;
          request.membership = null;
          return true;
        }
        throw new ForbiddenException('You do not have access to this workspace');
      }

      request.workspace = workspace;
      request.membership = membership;
      return true;
    }

    if (devMode) {
      request.workspace = workspace;
      request.membership = null;
      return true;
    }

    throw new ForbiddenException('Authentication required for workspace access');
  }
}
