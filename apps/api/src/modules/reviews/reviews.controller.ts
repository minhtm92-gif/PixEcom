import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentWorkspace } from '../../common/decorators/workspace.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MemberRole } from '@prisma/client';

@ApiTags('Reviews')
@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Create a product review (admin-only)' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentWorkspace('id') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(
      workspaceId,
      productId,
      userId,
      createReviewDto,
    );
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List all reviews for a product (admin view)' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  findAll(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentWorkspace('id') workspaceId: string,
  ) {
    return this.reviewsService.findAll(workspaceId, productId);
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public reviews for a product' })
  @ApiResponse({ status: 200, description: 'Public reviews retrieved successfully' })
  getPublicReviews(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviewsService.findPublicReviews(productId);
  }

  @Get('stats')
  @Public()
  @ApiOperation({ summary: 'Get review statistics for a product' })
  @ApiResponse({ status: 200, description: 'Review stats retrieved successfully' })
  getStats(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviewsService.getStats(productId);
  }

  @Get(':reviewId')
  @ApiBearerAuth()
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'Get a specific review by ID' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  findOne(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @CurrentWorkspace('id') workspaceId: string,
  ) {
    return this.reviewsService.findOne(workspaceId, productId, reviewId);
  }

  @Patch(':reviewId')
  @ApiBearerAuth()
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @CurrentWorkspace('id') workspaceId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(
      workspaceId,
      productId,
      reviewId,
      updateReviewDto,
    );
  }

  @Delete(':reviewId')
  @ApiBearerAuth()
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  remove(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @CurrentWorkspace('id') workspaceId: string,
  ) {
    return this.reviewsService.remove(workspaceId, productId, reviewId);
  }
}
