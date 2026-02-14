import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsObject,
  MinLength,
  MaxLength,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class CreateVariantDto {
  @ApiProperty({ example: 'Red / Large' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'SKU-001-RED-L' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ example: 29.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceOverride?: number;

  @ApiPropertyOptional({ example: 39.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: { color: 'Red', size: 'Large' } })
  @IsOptional()
  @IsObject()
  options?: Record<string, string>;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;
}

export class CreateMediaDto {
  @ApiProperty({ example: 'https://cdn.example.com/product.jpg' })
  @IsString()
  @MaxLength(1000)
  url: string;

  @ApiPropertyOptional({ example: 'Product front view' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;

  @ApiPropertyOptional({ example: 'image' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mediaType?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  isPrimary?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Premium T-Shirt' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'premium-t-shirt' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 39.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 15.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 'SKU-001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ example: 'A premium quality t-shirt' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  descriptionBlocks?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  shippingInfo?: Record<string, any>;

  @ApiPropertyOptional({ example: ['clothing', 'premium'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ type: [CreateVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];

  @ApiPropertyOptional({ type: [CreateMediaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media?: CreateMediaDto[];
}
