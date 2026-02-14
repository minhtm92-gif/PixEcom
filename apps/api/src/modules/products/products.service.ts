import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../common/utils/storage.service';
import { CreateProductDto, CreateVariantDto, CreateMediaDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(
    workspaceId: string,
    options: { page?: number; limit?: number; search?: string; status?: string },
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { workspaceId };

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { sku: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    if (options.status && Object.values(ProductStatus).includes(options.status as ProductStatus)) {
      where.status = options.status as ProductStatus;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          variants: {
            select: { id: true, name: true, priceOverride: true, stockQuantity: true, isActive: true },
            orderBy: { position: 'asc' },
          },
          media: {
            where: { isPrimary: true },
            select: { id: true, url: true, altText: true },
            take: 1,
          },
          _count: { select: { variants: true, sellpages: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => ({
        ...p,
        primaryImage: p.media[0] || null,
        media: undefined,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(workspaceId: string, userId: string, dto: CreateProductDto) {
    const { variants, media, ...productData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          workspaceId,
          createdBy: userId,
          name: productData.name,
          slug: productData.slug,
          basePrice: productData.basePrice,
          compareAtPrice: productData.compareAtPrice,
          costPrice: productData.costPrice,
          currency: productData.currency || 'USD',
          sku: productData.sku,
          description: productData.description,
          descriptionBlocks: productData.descriptionBlocks || [],
          shippingInfo: productData.shippingInfo || {},
          tags: productData.tags || [],
          status: productData.status || ProductStatus.DRAFT,
        },
      });

      // Create variants if provided
      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v, index) => ({
            productId: product.id,
            name: v.name,
            sku: v.sku,
            priceOverride: v.priceOverride,
            compareAtPrice: v.compareAtPrice,
            options: v.options || {},
            stockQuantity: v.stockQuantity || 0,
            position: v.position ?? index,
          })),
        });
      } else {
        // Auto-create a default variant
        await tx.productVariant.create({
          data: {
            productId: product.id,
            name: 'Default',
            sku: productData.sku,
            priceOverride: null,
            stockQuantity: 0,
            position: 0,
          },
        });
      }

      // Create media if provided
      if (media && media.length > 0) {
        await tx.productMedia.createMany({
          data: media.map((m, index) => ({
            productId: product.id,
            url: m.url,
            altText: m.altText,
            mediaType: m.mediaType || 'image',
            displayOrder: m.displayOrder ?? index,
            isPrimary: m.isPrimary ?? index === 0,
          })),
        });
      }

      // Fetch and return the complete product
      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          variants: { orderBy: { position: 'asc' } },
          media: { orderBy: { displayOrder: 'asc' } },
        },
      });
    });
  }

  async findOne(workspaceId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, workspaceId },
      include: {
        variants: { orderBy: { position: 'asc' } },
        media: { orderBy: { displayOrder: 'asc' } },
        sellpages: {
          select: {
            id: true,
            slug: true,
            status: true,
            titleOverride: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
        _count: { select: { variants: true, orderItems: true, sellpages: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(workspaceId: string, productId: string, dto: UpdateProductDto) {
    await this.ensureProductExists(workspaceId, productId);

    return this.prisma.product.update({
      where: { id: productId },
      data: dto,
      include: {
        variants: { orderBy: { position: 'asc' } },
        media: { orderBy: { displayOrder: 'asc' } },
      },
    });
  }

  async remove(workspaceId: string, productId: string) {
    const product = await this.ensureProductExists(workspaceId, productId);

    // Check if product has PUBLISHED sellpages (active ones)
    const publishedSellpages = await this.prisma.sellpage.count({
      where: { productId, status: 'PUBLISHED' },
    });

    if (publishedSellpages > 0) {
      throw new BadRequestException(
        'Cannot delete product with published sell pages. Unpublish or delete the sell pages first.',
      );
    }

    // Delete all draft/archived sellpages and related data first
    await this.prisma.$transaction(async (tx) => {
      // Delete sellpage preview tokens
      await tx.sellpagePreviewToken.deleteMany({
        where: {
          sellpage: {
            productId,
          },
        },
      });

      // Delete all non-published sellpages
      await tx.sellpage.deleteMany({
        where: {
          productId,
          status: { not: 'PUBLISHED' },
        },
      });

      // Now delete the product (cascades will handle variants, media, reviews)
      await tx.product.delete({
        where: { id: productId },
      });
    });
  }

  // ── Variants ──────────────────────────────────────────

  async findVariants(workspaceId: string, productId: string) {
    await this.ensureProductExists(workspaceId, productId);

    return this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { position: 'asc' },
    });
  }

  async addVariant(workspaceId: string, productId: string, dto: CreateVariantDto) {
    await this.ensureProductExists(workspaceId, productId);

    // Get the max position
    const maxPosition = await this.prisma.productVariant.aggregate({
      where: { productId },
      _max: { position: true },
    });

    return this.prisma.productVariant.create({
      data: {
        productId,
        name: dto.name,
        sku: dto.sku,
        priceOverride: dto.priceOverride,
        compareAtPrice: dto.compareAtPrice,
        options: dto.options || {},
        stockQuantity: dto.stockQuantity || 0,
        position: dto.position ?? (maxPosition._max.position || 0) + 1,
      },
    });
  }

  async updateVariant(
    workspaceId: string,
    productId: string,
    variantId: string,
    dto: Partial<CreateVariantDto>,
  ) {
    await this.ensureProductExists(workspaceId, productId);

    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        name: dto.name,
        sku: dto.sku,
        priceOverride: dto.priceOverride,
        compareAtPrice: dto.compareAtPrice,
        options: dto.options,
        stockQuantity: dto.stockQuantity,
        position: dto.position,
      },
    });
  }

  async removeVariant(workspaceId: string, productId: string, variantId: string) {
    await this.ensureProductExists(workspaceId, productId);

    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Ensure at least one variant remains
    const variantCount = await this.prisma.productVariant.count({
      where: { productId },
    });

    if (variantCount <= 1) {
      throw new BadRequestException('Product must have at least one variant');
    }

    await this.prisma.productVariant.delete({
      where: { id: variantId },
    });
  }

  // ── Media ─────────────────────────────────────────────

  async findMedia(workspaceId: string, productId: string) {
    await this.ensureProductExists(workspaceId, productId);

    return this.prisma.productMedia.findMany({
      where: { productId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async addMedia(workspaceId: string, productId: string, dto: CreateMediaDto) {
    await this.ensureProductExists(workspaceId, productId);

    // If this is set as primary, unset other primaries
    if (dto.isPrimary) {
      await this.prisma.productMedia.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const maxOrder = await this.prisma.productMedia.aggregate({
      where: { productId },
      _max: { displayOrder: true },
    });

    return this.prisma.productMedia.create({
      data: {
        productId,
        url: dto.url,
        altText: dto.altText,
        mediaType: dto.mediaType || 'image',
        displayOrder: dto.displayOrder ?? (maxOrder._max.displayOrder || 0) + 1,
        isPrimary: dto.isPrimary ?? false,
      },
    });
  }

  async removeMedia(workspaceId: string, productId: string, mediaId: string) {
    await this.ensureProductExists(workspaceId, productId);

    const media = await this.prisma.productMedia.findFirst({
      where: { id: mediaId, productId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    await this.prisma.productMedia.delete({
      where: { id: mediaId },
    });

    // If the deleted media was primary, set the first remaining as primary
    if (media.isPrimary) {
      const firstMedia = await this.prisma.productMedia.findFirst({
        where: { productId },
        orderBy: { displayOrder: 'asc' },
      });

      if (firstMedia) {
        await this.prisma.productMedia.update({
          where: { id: firstMedia.id },
          data: { isPrimary: true },
        });
      }
    }
  }

  /**
   * Bulk upload product media with file validation
   */
  async uploadBulkMedia(
    workspaceId: string,
    productId: string,
    files: Express.Multer.File[],
  ) {
    await this.ensureProductExists(workspaceId, productId);

    // Validate files
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 100) {
      throw new BadRequestException('Maximum 100 files allowed per upload');
    }

    for (const file of files) {
      // Check file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        throw new BadRequestException(
          `File "${file.originalname}" exceeds 50MB limit`,
        );
      }

      // Check file type (images and videos)
      const isImage = file.mimetype.startsWith('image/');
      const isVideo = file.mimetype.startsWith('video/');

      if (!isImage && !isVideo) {
        throw new BadRequestException(
          `File "${file.originalname}" must be an image or video`,
        );
      }
    }

    // Get current max position
    const maxPosition = await this.prisma.productMedia.aggregate({
      where: { productId },
      _max: { position: true },
    });
    const startPosition = (maxPosition._max.position || 0) + 1;

    // Check if product has any media (first upload will be primary)
    const existingMediaCount = await this.prisma.productMedia.count({
      where: { productId },
    });

    // Save files and create media records
    const mediaRecords = await Promise.all(
      files.map(async (file, index) => {
        const url = await this.storageService.saveFile(
          file,
          `products/${productId}`,
        );

        return this.prisma.productMedia.create({
          data: {
            productId,
            url,
            altText: file.originalname,
            position: startPosition + index,
            displayOrder: startPosition + index,
            fileSize: file.size,
            isPrimary: existingMediaCount === 0 && index === 0, // First file is primary if no existing media
          },
        });
      }),
    );

    return mediaRecords;
  }

  /**
   * Reorder product media by providing an array of media IDs in desired order
   */
  async reorderMedia(
    workspaceId: string,
    productId: string,
    mediaIds: string[],
  ) {
    await this.ensureProductExists(workspaceId, productId);

    // Verify all mediaIds belong to this product
    const mediaCount = await this.prisma.productMedia.count({
      where: { productId, id: { in: mediaIds } },
    });

    if (mediaCount !== mediaIds.length) {
      throw new BadRequestException('Invalid media IDs provided');
    }

    // Update positions in transaction
    await this.prisma.$transaction(
      mediaIds.map((id, index) =>
        this.prisma.productMedia.update({
          where: { id },
          data: { position: index, displayOrder: index },
        }),
      ),
    );

    // Return updated media list
    return this.prisma.productMedia.findMany({
      where: { productId },
      orderBy: { position: 'asc' },
    });
  }

  /**
   * Delete media with file cleanup
   */
  async deleteMedia(workspaceId: string, productId: string, mediaId: string) {
    await this.ensureProductExists(workspaceId, productId);

    const media = await this.prisma.productMedia.findFirst({
      where: { id: mediaId, productId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Delete file from storage
    await this.storageService.deleteFile(media.url);

    // Delete database record
    await this.prisma.productMedia.delete({
      where: { id: mediaId },
    });

    // If the deleted media was primary, set the first remaining as primary
    if (media.isPrimary) {
      const firstMedia = await this.prisma.productMedia.findFirst({
        where: { productId },
        orderBy: { position: 'asc' },
      });

      if (firstMedia) {
        await this.prisma.productMedia.update({
          where: { id: firstMedia.id },
          data: { isPrimary: true },
        });
      }
    }
  }

  private async ensureProductExists(workspaceId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, workspaceId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
