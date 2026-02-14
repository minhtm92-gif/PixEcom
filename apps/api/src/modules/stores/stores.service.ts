import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId: string, options: { page?: number; limit?: number }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where: { workspaceId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { sellpages: true, orders: true } },
        },
      }),
      this.prisma.store.count({ where: { workspaceId } }),
    ]);

    return {
      data: stores,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(workspaceId: string, dto: CreateStoreDto) {
    return this.prisma.store.create({
      data: {
        workspaceId,
        name: dto.name,
        slug: dto.slug,
        primaryDomain: dto.primaryDomain,
        logoUrl: dto.logoUrl,
        faviconUrl: dto.faviconUrl,
        brandColor: dto.brandColor,
        currency: dto.currency || 'USD',
      },
    });
  }

  async findOne(workspaceId: string, storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, workspaceId },
      include: {
        sellpages: {
          select: { id: true, slug: true, status: true, titleOverride: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        storePolicies: {
          include: {
            policy: {
              select: { id: true, title: true, slug: true, policyType: true },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
        _count: { select: { sellpages: true, orders: true } },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async update(workspaceId: string, storeId: string, dto: UpdateStoreDto) {
    await this.ensureStoreExists(workspaceId, storeId);

    return this.prisma.store.update({
      where: { id: storeId },
      data: dto,
    });
  }

  async remove(workspaceId: string, storeId: string) {
    await this.ensureStoreExists(workspaceId, storeId);

    await this.prisma.store.delete({
      where: { id: storeId },
    });
  }

  async getHomepage(workspaceId: string, storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, workspaceId },
      select: {
        id: true,
        homepageTitle: true,
        homepageDescription: true,
        homepageConfig: true,
        themeConfig: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async updateHomepage(
    workspaceId: string,
    storeId: string,
    data: { homepageTitle?: string; homepageDescription?: string; homepageConfig?: any },
  ) {
    await this.ensureStoreExists(workspaceId, storeId);

    return this.prisma.store.update({
      where: { id: storeId },
      data: {
        homepageTitle: data.homepageTitle,
        homepageDescription: data.homepageDescription,
        homepageConfig: data.homepageConfig,
      },
      select: {
        id: true,
        homepageTitle: true,
        homepageDescription: true,
        homepageConfig: true,
      },
    });
  }

  private async ensureStoreExists(workspaceId: string, storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, workspaceId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }
}
