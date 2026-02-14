import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { ProductsService } from './products.service';
import { CreateProductDto, CreateVariantDto, CreateMediaDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ReorderMediaDto } from './dto/reorder-media.dto';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentWorkspace } from '../../common/decorators/workspace.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List products in workspace' })
  findAll(
    @CurrentWorkspace('id') workspaceId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.productsService.findAll(workspaceId, { page, limit, search, status });
  }

  @Post()
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Create a new product with optional variants and media' })
  create(
    @CurrentWorkspace('id') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(workspaceId, userId, dto);
  }

  @Get(':id')
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.findOne(workspaceId, id);
  }

  @Patch(':id')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Update product' })
  update(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  remove(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.remove(workspaceId, id);
  }

  // ── Variants sub-routes ───────────────────────────────

  @Get(':id/variants')
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List product variants' })
  findVariants(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) productId: string,
  ) {
    return this.productsService.findVariants(workspaceId, productId);
  }

  @Post(':id/variants')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Add variant to product' })
  addVariant(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.productsService.addVariant(workspaceId, productId, dto);
  }

  @Patch(':id/variants/:variantId')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Update a variant' })
  updateVariant(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: Partial<CreateVariantDto>,
  ) {
    return this.productsService.updateVariant(workspaceId, productId, variantId, dto);
  }

  @Delete(':id/variants/:variantId')
  @Roles(MemberRole.EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a variant' })
  removeVariant(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ) {
    return this.productsService.removeVariant(workspaceId, productId, variantId);
  }

  // ── Media sub-routes ──────────────────────────────────

  @Get(':id/media')
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List product media' })
  findMedia(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) productId: string,
  ) {
    return this.productsService.findMedia(workspaceId, productId);
  }

  @Post(':id/media')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Add media to product' })
  addMedia(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: CreateMediaDto,
  ) {
    return this.productsService.addMedia(workspaceId, productId, dto);
  }

  @Post(':id/media/bulk')
  @Roles(MemberRole.EDITOR)
  @UseInterceptors(FilesInterceptor('files', 100))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Bulk upload product media (max 100 files, 50MB each, supports images & videos)' })
  uploadBulkMedia(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) productId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.uploadBulkMedia(workspaceId, productId, files);
  }

  @Put(':id/media/reorder')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Reorder product media' })
  reorderMedia(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() dto: ReorderMediaDto,
  ) {
    return this.productsService.reorderMedia(workspaceId, productId, dto.mediaIds);
  }

  @Delete(':id/media/:mediaId')
  @Roles(MemberRole.EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product media' })
  removeMedia(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    return this.productsService.deleteMedia(workspaceId, productId, mediaId);
  }
}
