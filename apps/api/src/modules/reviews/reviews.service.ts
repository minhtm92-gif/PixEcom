import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new review (admin-only)
   */
  async create(
    workspaceId: string,
    productId: string,
    userId: string,
    dto: CreateReviewDto,
  ) {
    // Verify product exists and belongs to workspace
    const product = await this.prisma.product.findFirst({
      where: { id: productId, workspaceId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.productReview.create({
      data: {
        workspaceId,
        productId,
        createdBy: userId,
        authorName: dto.authorName,
        avatarUrl: dto.avatarUrl,
        rating: dto.rating,
        body: dto.body,
        isVisible: dto.isVisible ?? true,
        createdAtOverride: dto.createdAtOverride
          ? new Date(dto.createdAtOverride)
          : null,
      },
    });
  }

  /**
   * List all reviews for a product (admin view)
   */
  async findAll(workspaceId: string, productId: string) {
    // Verify product exists
    const product = await this.prisma.product.findFirst({
      where: { id: productId, workspaceId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });
  }

  /**
   * Get public reviews for a product (only visible reviews)
   */
  async findPublicReviews(productId: string) {
    const reviews = await this.prisma.productReview.findMany({
      where: {
        productId,
        isVisible: true,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        authorName: true,
        avatarUrl: true,
        rating: true,
        body: true,
        createdAtOverride: true,
        createdAt: true,
      },
    });

    // Use createdAtOverride if present, otherwise use createdAt
    return reviews.map((review) => ({
      ...review,
      displayDate: review.createdAtOverride || review.createdAt,
      createdAtOverride: undefined, // Don't expose this field publicly
    }));
  }

  /**
   * Get a single review by ID
   */
  async findOne(workspaceId: string, productId: string, reviewId: string) {
    const review = await this.prisma.productReview.findFirst({
      where: {
        id: reviewId,
        productId,
        workspaceId,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  /**
   * Update a review
   */
  async update(
    workspaceId: string,
    productId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ) {
    // Verify review exists
    await this.findOne(workspaceId, productId, reviewId);

    return this.prisma.productReview.update({
      where: { id: reviewId },
      data: {
        authorName: dto.authorName,
        avatarUrl: dto.avatarUrl,
        rating: dto.rating,
        body: dto.body,
        isVisible: dto.isVisible,
        createdAtOverride: dto.createdAtOverride
          ? new Date(dto.createdAtOverride)
          : undefined,
      },
    });
  }

  /**
   * Delete a review
   */
  async remove(workspaceId: string, productId: string, reviewId: string) {
    // Verify review exists
    await this.findOne(workspaceId, productId, reviewId);

    await this.prisma.productReview.delete({
      where: { id: reviewId },
    });
  }

  /**
   * Get review statistics for a product
   */
  async getStats(productId: string) {
    const reviews = await this.prisma.productReview.findMany({
      where: { productId, isVisible: true },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = sumRatings / totalReviews;

    const ratingDistribution = reviews.reduce(
      (dist, r) => {
        dist[r.rating] = (dist[r.rating] || 0) + 1;
        return dist;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
    );

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingDistribution,
    };
  }
}
