import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { MemberRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId, isActive: true },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
      membershipId: m.id,
    }));
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          logoUrl: dto.logoUrl,
        },
      });

      // Auto-create OWNER membership for the creating user
      const membership = await tx.membership.create({
        data: {
          workspaceId: workspace.id,
          userId,
          role: MemberRole.OWNER,
        },
      });

      // Auto-create default general settings
      await tx.generalSettings.create({
        data: {
          workspaceId: workspace.id,
          brandName: dto.name,
        },
      });

      return { ...workspace, membership };
    });

    return result;
  }

  async findOne(id: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            memberships: true,
            stores: true,
            products: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async update(id: string, dto: UpdateWorkspaceDto) {
    await this.findOne(id);

    return this.prisma.workspace.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.workspace.delete({
      where: { id },
    });
  }

  // ── Members ───────────────────────────────────────────

  async findMembers(workspaceId: string) {
    const members = await this.prisma.membership.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      role: m.role,
      isActive: m.isActive,
      createdAt: m.createdAt,
      user: m.user,
    }));
  }

  async addMember(workspaceId: string, userId: string, role?: MemberRole) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for existing membership
    const existing = await this.prisma.membership.findUnique({
      where: {
        uq_membership_ws_user: { workspaceId, userId },
      },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this workspace');
    }

    return this.prisma.membership.create({
      data: {
        workspaceId,
        userId,
        role: role || MemberRole.EDITOR,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async updateMember(workspaceId: string, memberId: string, role: MemberRole) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: memberId, workspaceId },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.role === MemberRole.OWNER && role !== MemberRole.OWNER) {
      // Ensure there is at least one other owner
      const ownerCount = await this.prisma.membership.count({
        where: { workspaceId, role: MemberRole.OWNER },
      });
      if (ownerCount <= 1) {
        throw new ForbiddenException('Cannot change the role of the last owner');
      }
    }

    return this.prisma.membership.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });
  }

  async removeMember(workspaceId: string, memberId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { id: memberId, workspaceId },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.role === MemberRole.OWNER) {
      const ownerCount = await this.prisma.membership.count({
        where: { workspaceId, role: MemberRole.OWNER },
      });
      if (ownerCount <= 1) {
        throw new ForbiddenException('Cannot remove the last owner from the workspace');
      }
    }

    await this.prisma.membership.delete({
      where: { id: memberId },
    });
  }
}
