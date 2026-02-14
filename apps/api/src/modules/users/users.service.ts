import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { MemberRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    workspaceId: string,
    options: { page?: number; limit?: number; search?: string },
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      memberships: {
        some: { workspaceId, isActive: true },
      },
    };

    if (options.search) {
      where.OR = [
        { email: { contains: options.search, mode: 'insensitive' } },
        { displayName: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          memberships: {
            where: { workspaceId },
            select: { id: true, role: true, isActive: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        membership: u.memberships[0] || null,
        memberships: undefined,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(
    workspaceId: string,
    data: { email: string; displayName: string; password: string; role?: MemberRole },
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      // User exists, check if already a member of this workspace
      const existingMembership = await this.prisma.membership.findUnique({
        where: {
          uq_membership_ws_user: {
            workspaceId,
            userId: existing.id,
          },
        },
      });

      if (existingMembership) {
        throw new ConflictException('User is already a member of this workspace');
      }

      // Add existing user to workspace
      const membership = await this.prisma.membership.create({
        data: {
          workspaceId,
          userId: existing.id,
          role: data.role || MemberRole.EDITOR,
        },
      });

      return {
        id: existing.id,
        email: existing.email,
        displayName: existing.displayName,
        membership,
      };
    }

    // Create new user and membership in transaction
    const passwordHash = await bcrypt.hash(data.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          displayName: data.displayName,
          passwordHash,
        },
      });

      const membership = await tx.membership.create({
        data: {
          workspaceId,
          userId: user.id,
          role: data.role || MemberRole.EDITOR,
        },
      });

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
        createdAt: user.createdAt,
        membership,
      };
    });

    return result;
  }

  async findOne(workspaceId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        memberships: { some: { workspaceId, isActive: true } },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          where: { workspaceId },
          select: { id: true, role: true, isActive: true, createdAt: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found in this workspace');
    }

    return {
      ...user,
      membership: user.memberships[0] || null,
      memberships: undefined,
    };
  }

  async update(
    workspaceId: string,
    userId: string,
    data: { displayName?: string; avatarUrl?: string; isActive?: boolean },
  ) {
    // Verify user is in workspace
    await this.findOne(workspaceId, userId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async remove(workspaceId: string, userId: string, currentUserId: string) {
    if (userId === currentUserId) {
      throw new ForbiddenException('You cannot remove yourself from the workspace');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        uq_membership_ws_user: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('User is not a member of this workspace');
    }

    if (membership.role === MemberRole.OWNER) {
      throw new ForbiddenException('Cannot remove the workspace owner');
    }

    await this.prisma.membership.delete({
      where: { id: membership.id },
    });
  }
}
