import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_HIERARCHY: Record<MemberRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Superadmin bypasses all role checks
    if (user?.isSuperadmin) return true;

    const membership = request.membership;
    if (!membership) {
      throw new ForbiddenException('No workspace membership found');
    }

    const userRoleLevel = ROLE_HIERARCHY[membership.role as MemberRole] || 0;
    const minRequired = Math.min(...requiredRoles.map((r) => ROLE_HIERARCHY[r] || 0));

    if (userRoleLevel < minRequired) {
      throw new ForbiddenException(
        `Role '${membership.role}' does not have sufficient permissions`,
      );
    }

    return true;
  }
}
