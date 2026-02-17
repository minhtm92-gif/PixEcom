import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SellpageStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSellpageDto } from './dto/create-sellpage.dto';
import { UpdateSellpageDto } from './dto/update-sellpage.dto';
import { generateSellpageUrl } from './sellpages.utils';
import * as crypto from 'crypto';

@Injectable()
export class SellpagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    workspaceId: string,
    options: { page?: number; limit?: number; storeId?: string; status?: string },
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.SellpageWhereInput = { workspaceId };

    if (options.storeId) {
      where.storeId = options.storeId;
    }

    if (options.status && Object.values(SellpageStatus).includes(options.status as SellpageStatus)) {
      where.status = options.status as SellpageStatus;
    }

    const [sellpages, total] = await Promise.all([
      this.prisma.sellpage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: { select: { id: true, name: true, slug: true, primaryDomain: true } },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              media: {
                where: { isPrimary: true },
                select: { url: true },
                take: 1,
              },
            },
          },
          _count: { select: { orders: true } },
        },
      }),
      this.prisma.sellpage.count({ where }),
    ]);

    // Add publicUrl to each sellpage
    const sellpagesWithUrls = sellpages.map(sellpage => ({
      ...sellpage,
      publicUrl: generateSellpageUrl(sellpage),
    }));

    return {
      data: sellpagesWithUrls,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(workspaceId: string, userId: string, dto: CreateSellpageDto) {
    // Verify store belongs to workspace
    const store = await this.prisma.store.findFirst({
      where: { id: dto.storeId, workspaceId },
    });
    if (!store) {
      throw new BadRequestException('Store not found in this workspace');
    }

    // Verify product belongs to workspace
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, workspaceId },
    });
    if (!product) {
      throw new BadRequestException('Product not found in this workspace');
    }

    return this.prisma.sellpage.create({
      data: {
        workspaceId,
        storeId: dto.storeId,
        productId: dto.productId,
        slug: dto.slug,
        subdomain: dto.subdomain,
        customDomain: dto.customDomain,
        titleOverride: dto.titleOverride,
        descriptionOverride: dto.descriptionOverride,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        seoOgImage: dto.seoOgImage,
        status: dto.status,
        sections: dto.sections || [],
        headerConfig: dto.headerConfig || {},
        footerConfig: dto.footerConfig || {},
        boostModules: dto.boostModules || [],
        discountRules: dto.discountRules || [],
        assignedTo: dto.assignedTo,
        createdBy: userId,
      },
      include: {
        store: { select: { id: true, name: true, slug: true } },
        product: { select: { id: true, name: true, slug: true, basePrice: true } },
      },
    });
  }

  async findOne(workspaceId: string, sellpageId: string) {
    const sellpage = await this.prisma.sellpage.findFirst({
      where: { id: sellpageId, workspaceId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            primaryDomain: true,
            brandColor: true,
            logoUrl: true,
          },
        },
        product: {
          include: {
            variants: { where: { isActive: true }, orderBy: { position: 'asc' } },
            media: { orderBy: { displayOrder: 'asc' } },
          },
        },
        _count: { select: { orders: true } },
      },
    });

    if (!sellpage) {
      throw new NotFoundException('Sellpage not found');
    }

    return {
      ...sellpage,
      publicUrl: generateSellpageUrl(sellpage),
    };
  }

  async update(workspaceId: string, sellpageId: string, dto: UpdateSellpageDto) {
    await this.ensureSellpageExists(workspaceId, sellpageId);

    // Explicitly map only fields that exist on the Sellpage model
    const data: any = {};
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.subdomain !== undefined) data.subdomain = dto.subdomain;
    if (dto.customDomain !== undefined) data.customDomain = dto.customDomain;
    if (dto.sellpageDomain !== undefined) data.sellpageDomain = dto.sellpageDomain;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.titleOverride !== undefined) data.titleOverride = dto.titleOverride;
    if (dto.descriptionOverride !== undefined) data.descriptionOverride = dto.descriptionOverride;
    if (dto.seoTitle !== undefined) data.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) data.seoDescription = dto.seoDescription;
    if (dto.seoOgImage !== undefined) data.seoOgImage = dto.seoOgImage;
    if (dto.headerConfig !== undefined) data.headerConfig = dto.headerConfig;
    if (dto.footerConfig !== undefined) data.footerConfig = dto.footerConfig;
    if (dto.boostModules !== undefined) data.boostModules = dto.boostModules;
    if (dto.discountRules !== undefined) data.discountRules = dto.discountRules;
    if (dto.assignedTo !== undefined) data.assignedTo = dto.assignedTo;
    if (dto.facebookPixelId !== undefined) data.facebookPixelId = dto.facebookPixelId;
    if (dto.tiktokPixelId !== undefined) data.tiktokPixelId = dto.tiktokPixelId;
    if (dto.googleAnalyticsId !== undefined) data.googleAnalyticsId = dto.googleAnalyticsId;
    if (dto.googleTagManagerId !== undefined) data.googleTagManagerId = dto.googleTagManagerId;
    if (dto.logoUrl !== undefined) data.logoUrl = dto.logoUrl;
    if (dto.faviconUrl !== undefined) data.faviconUrl = dto.faviconUrl;

    return this.prisma.sellpage.update({
      where: { id: sellpageId },
      data,
      include: {
        store: { select: { id: true, name: true, slug: true } },
        product: { select: { id: true, name: true, slug: true, basePrice: true } },
      },
    });
  }

  async remove(workspaceId: string, sellpageId: string) {
    await this.ensureSellpageExists(workspaceId, sellpageId);

    await this.prisma.sellpage.delete({
      where: { id: sellpageId },
    });
  }

  async updateSections(workspaceId: string, sellpageId: string, sections: any[]) {
    await this.ensureSellpageExists(workspaceId, sellpageId);

    return this.prisma.sellpage.update({
      where: { id: sellpageId },
      data: { sections },
      select: {
        id: true,
        sections: true,
        updatedAt: true,
      },
    });
  }

  async changeStatus(workspaceId: string, sellpageId: string, status: SellpageStatus) {
    const sellpage = await this.ensureSellpageExists(workspaceId, sellpageId);

    if (status === SellpageStatus.PUBLISHED) {
      // Validate that the sellpage has the minimum required configuration
      const sections = sellpage.sections as any[];
      if (!sections || sections.length === 0) {
        throw new BadRequestException(
          'Cannot publish a sellpage without any sections configured',
        );
      }
    }

    return this.prisma.sellpage.update({
      where: { id: sellpageId },
      data: { status },
      include: {
        store: { select: { id: true, name: true, slug: true, primaryDomain: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * Generate a preview token for a sellpage
   */
  async createPreviewToken(
    workspaceId: string,
    sellpageId: string,
    userId: string,
  ) {
    // Verify sellpage exists
    await this.ensureSellpageExists(workspaceId, sellpageId);

    // Generate random token (32 bytes)
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Create token record with 7-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.sellpagePreviewToken.create({
      data: {
        sellpageId,
        tokenHash,
        expiresAt,
        createdBy: userId,
      },
    });

    // Return plain token (only time it's visible)
    return {
      token,
      expiresAt,
      previewUrl: `/preview/${token}`, // Frontend will construct full URL
    };
  }

  /**
   * List active preview tokens for a sellpage
   */
  async listPreviewTokens(workspaceId: string, sellpageId: string) {
    // Verify sellpage exists
    await this.ensureSellpageExists(workspaceId, sellpageId);

    // List non-expired tokens
    return this.prisma.sellpagePreviewToken.findMany({
      where: {
        sellpageId,
        expiresAt: { gte: new Date() },
      },
      select: {
        id: true,
        expiresAt: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete a preview token
   */
  async deletePreviewToken(
    workspaceId: string,
    sellpageId: string,
    tokenId: string,
  ) {
    // Verify sellpage exists
    await this.ensureSellpageExists(workspaceId, sellpageId);

    const token = await this.prisma.sellpagePreviewToken.findFirst({
      where: { id: tokenId, sellpageId },
    });

    if (!token) {
      throw new NotFoundException('Preview token not found');
    }

    await this.prisma.sellpagePreviewToken.delete({
      where: { id: tokenId },
    });
  }

  /**
   * Get sellpage by preview token (public access)
   */
  async getByPreviewToken(token: string) {
    // Hash the token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find token record
    const tokenRecord = await this.prisma.sellpagePreviewToken.findUnique({
      where: { tokenHash },
      include: {
        sellpage: {
          include: {
            product: {
              include: {
                variants: { orderBy: { position: 'asc' } },
                media: { orderBy: { position: 'asc' } },
              },
            },
            store: true,
          },
        },
      },
    });

    // Check if token exists and is not expired
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new NotFoundException('Preview not found or expired');
    }

    // Get product reviews
    const reviews = await this.prisma.productReview.findMany({
      where: {
        productId: tokenRecord.sellpage.productId,
        isVisible: true,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        authorName: true,
        avatarUrl: true,
        rating: true,
        body: true,
        createdAt: true,
        createdAtOverride: true,
      },
    });

    return {
      sellpage: {
        id: tokenRecord.sellpage.id,
        slug: tokenRecord.sellpage.slug,
        titleOverride: tokenRecord.sellpage.titleOverride,
        descriptionOverride: tokenRecord.sellpage.descriptionOverride,
        sections: tokenRecord.sellpage.sections,
        status: tokenRecord.sellpage.status,
      },
      product: {
        id: tokenRecord.sellpage.product.id,
        name: tokenRecord.sellpage.product.name,
        slug: tokenRecord.sellpage.product.slug,
        basePrice: Number(tokenRecord.sellpage.product.basePrice),
        compareAtPrice: tokenRecord.sellpage.product.compareAtPrice
          ? Number(tokenRecord.sellpage.product.compareAtPrice)
          : null,
        currency: tokenRecord.sellpage.product.currency,
        description: tokenRecord.sellpage.product.description,
        variants: tokenRecord.sellpage.product.variants.map((v) => ({
          ...v,
          priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        })),
        media: tokenRecord.sellpage.product.media,
      },
      reviews: reviews.map((r) => ({
        ...r,
        createdAt: r.createdAtOverride || r.createdAt,
      })),
      expiresAt: tokenRecord.expiresAt,
    };
  }

  /**
   * Duplicate a sellpage
   */
  async duplicate(
    workspaceId: string,
    userId: string,
    sellpageId: string,
    options?: { slug?: string; titleOverride?: string },
  ) {
    // Get the original sellpage
    const original = await this.ensureSellpageExists(workspaceId, sellpageId);

    // Generate new slug if not provided
    let newSlug = options?.slug || `${original.slug}-copy`;

    // Ensure slug is unique
    let counter = 1;
    while (true) {
      const existing = await this.prisma.sellpage.findFirst({
        where: { workspaceId, slug: newSlug },
      });
      if (!existing) break;
      newSlug = options?.slug
        ? `${options.slug}-${counter}`
        : `${original.slug}-copy-${counter}`;
      counter++;
    }

    // Create duplicate with DRAFT status
    const duplicate = await this.prisma.sellpage.create({
      data: {
        workspaceId,
        storeId: original.storeId,
        productId: original.productId,
        slug: newSlug,
        subdomain: null, // Don't copy subdomain
        customDomain: null, // Don't copy custom domain
        titleOverride: options?.titleOverride || (original.titleOverride ? `${original.titleOverride} (Copy)` : null),
        descriptionOverride: original.descriptionOverride,
        seoTitle: original.seoTitle,
        seoDescription: original.seoDescription,
        seoOgImage: original.seoOgImage,
        status: SellpageStatus.DRAFT, // Always start as draft
        sections: original.sections as Prisma.InputJsonValue,
        headerConfig: original.headerConfig as Prisma.InputJsonValue,
        footerConfig: original.footerConfig as Prisma.InputJsonValue,
        boostModules: original.boostModules as Prisma.InputJsonValue,
        discountRules: original.discountRules as Prisma.InputJsonValue,
        createdBy: userId,
      },
      include: {
        store: { select: { id: true, name: true, slug: true } },
        product: { select: { id: true, name: true, slug: true, basePrice: true } },
      },
    });

    return duplicate;
  }

  private async ensureSellpageExists(workspaceId: string, sellpageId: string) {
    const sellpage = await this.prisma.sellpage.findFirst({
      where: { id: sellpageId, workspaceId },
    });

    if (!sellpage) {
      throw new NotFoundException('Sellpage not found');
    }

    return sellpage;
  }
}
