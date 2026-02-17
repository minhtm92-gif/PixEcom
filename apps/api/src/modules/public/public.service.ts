import { Injectable, NotFoundException } from '@nestjs/common';
import { SellpageStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getStoreByDomain(domain: string) {
    const store = await this.prisma.store.findFirst({
      where: {
        primaryDomain: domain,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        primaryDomain: true,
        logoUrl: true,
        faviconUrl: true,
        brandColor: true,
        currency: true,
        themeConfig: true,
        storePolicies: {
          include: {
            policy: {
              select: {
                id: true,
                title: true,
                slug: true,
                policyType: true,
              },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async getStoreHomepage(domain: string) {
    const store = await this.prisma.store.findFirst({
      where: {
        primaryDomain: domain,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        primaryDomain: true,
        logoUrl: true,
        faviconUrl: true,
        brandColor: true,
        currency: true,
        homepageTitle: true,
        homepageDescription: true,
        homepageConfig: true,
        themeConfig: true,
        sellpages: {
          where: { status: SellpageStatus.PUBLISHED },
          select: {
            id: true,
            slug: true,
            titleOverride: true,
            seoOgImage: true,
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                compareAtPrice: true,
                currency: true,
                media: {
                  where: { isPrimary: true },
                  select: { url: true, altText: true },
                  take: 1,
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return {
      ...store,
      sellpages: store.sellpages.map((sp) => ({
        ...sp,
        product: {
          ...sp.product,
          basePrice: Number(sp.product.basePrice),
          compareAtPrice: sp.product.compareAtPrice
            ? Number(sp.product.compareAtPrice)
            : null,
          primaryImage: sp.product.media[0] || null,
          media: undefined,
        },
      })),
    };
  }

  async getSellpage(storeSlug: string, sellpageSlug: string) {
    // Find the store by slug (need to search across workspaces)
    const store = await this.prisma.store.findFirst({
      where: {
        slug: storeSlug,
        isActive: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const sellpage = await this.prisma.sellpage.findFirst({
      where: {
        storeId: store.id,
        slug: sellpageSlug,
        status: SellpageStatus.PUBLISHED,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            primaryDomain: true,
            logoUrl: true,
            faviconUrl: true,
            brandColor: true,
            currency: true,
            themeConfig: true,
            storePolicies: {
              include: {
                policy: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    policyType: true,
                    bodyHtml: true,
                  },
                },
              },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
        product: {
          include: {
            variants: {
              where: { isActive: true },
              orderBy: { position: 'asc' },
              select: {
                id: true,
                name: true,
                sku: true,
                priceOverride: true,
                compareAtPrice: true,
                options: true,
                stockQuantity: true,
                position: true,
              },
            },
            media: {
              orderBy: { displayOrder: 'asc' },
              select: {
                id: true,
                url: true,
                altText: true,
                mediaType: true,
                displayOrder: true,
                isPrimary: true,
              },
            },
          },
        },
      },
    });

    if (!sellpage) {
      throw new NotFoundException('Sellpage not found');
    }

    return {
      id: sellpage.id,
      slug: sellpage.slug,
      titleOverride: sellpage.titleOverride,
      descriptionOverride: sellpage.descriptionOverride,
      seoTitle: sellpage.seoTitle,
      seoDescription: sellpage.seoDescription,
      seoOgImage: sellpage.seoOgImage,
      sections: sellpage.sections,
      headerConfig: sellpage.headerConfig,
      footerConfig: sellpage.footerConfig,
      boostModules: sellpage.boostModules,
      discountRules: sellpage.discountRules,
      store: sellpage.store,
      product: {
        id: sellpage.product.id,
        name: sellpage.product.name,
        slug: sellpage.product.slug,
        basePrice: Number(sellpage.product.basePrice),
        compareAtPrice: sellpage.product.compareAtPrice
          ? Number(sellpage.product.compareAtPrice)
          : null,
        currency: sellpage.product.currency,
        description: sellpage.product.description,
        descriptionBlocks: sellpage.product.descriptionBlocks,
        shippingInfo: sellpage.product.shippingInfo,
        variants: sellpage.product.variants.map((v) => ({
          ...v,
          priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        })),
        media: sellpage.product.media,
      },
    };
  }

  async getSellpageWithData(storeSlug: string, sellpageSlug: string) {
    // Find the store by slug
    const store = await this.prisma.store.findFirst({
      where: {
        slug: storeSlug,
        isActive: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Find sellpage
    const sellpage = await this.prisma.sellpage.findFirst({
      where: {
        storeId: store.id,
        slug: sellpageSlug,
        status: SellpageStatus.PUBLISHED,
      },
      include: {
        product: {
          include: {
            variants: {
              where: { isActive: true },
              orderBy: { position: 'asc' },
            },
            media: {
              orderBy: [{ position: 'asc' }, { displayOrder: 'asc' }],
            },
          },
        },
      },
    });

    if (!sellpage) {
      throw new NotFoundException('Sellpage not found');
    }

    // Get product reviews
    const reviews = await this.prisma.productReview.findMany({
      where: {
        productId: sellpage.productId,
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

    // Get legal policies for this store
    const legalPolicies = await this.prisma.legalPolicy
      .findMany({
        where: {
          isActive: true,
          ...(store.legalSetId
            ? { legalSetId: store.legalSetId }
            : { workspaceId: store.workspaceId }),
        },
        select: { id: true, title: true, slug: true, policyType: true },
        orderBy: { displayOrder: 'asc' },
      })
      .catch(() => []);

    return {
      sellpage: {
        id: sellpage.id,
        slug: sellpage.slug,
        titleOverride: sellpage.titleOverride,
        descriptionOverride: sellpage.descriptionOverride,
        sections: sellpage.sections,
        status: sellpage.status,
        logoUrl: (sellpage as any).logoUrl || null,
        faviconUrl: (sellpage as any).faviconUrl || null,
        seoTitle: (sellpage as any).seoTitle || null,
        seoDescription: (sellpage as any).seoDescription || null,
        seoOgImage: (sellpage as any).seoOgImage || null,
        facebookPixelId: (sellpage as any).facebookPixelId || null,
        tiktokPixelId: (sellpage as any).tiktokPixelId || null,
        googleAnalyticsId: (sellpage as any).googleAnalyticsId || null,
        googleTagManagerId: (sellpage as any).googleTagManagerId || null,
      },
      store: {
        name: store.name,
        slug: store.slug,
        logoUrl: (sellpage as any).logoUrl || (store as any).logoUrl || null,
        faviconUrl: (sellpage as any).faviconUrl || (store as any).faviconUrl || null,
        brandColor: (store as any).brandColor || null,
        primaryDomain: (store as any).primaryDomain || null,
      },
      legalPolicies,
      product: {
        id: sellpage.product.id,
        name: sellpage.product.name,
        slug: sellpage.product.slug,
        basePrice: Number(sellpage.product.basePrice),
        compareAtPrice: sellpage.product.compareAtPrice
          ? Number(sellpage.product.compareAtPrice)
          : null,
        currency: sellpage.product.currency,
        description: sellpage.product.description,
        variants: sellpage.product.variants.map((v) => ({
          ...v,
          priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        })),
        media: sellpage.product.media,
      },
      reviews: reviews.map((r) => ({
        ...r,
        createdAt: r.createdAtOverride || r.createdAt,
      })),
    };
  }
}
