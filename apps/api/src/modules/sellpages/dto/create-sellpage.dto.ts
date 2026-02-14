import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  IsObject,
  MinLength,
  MaxLength,
  Matches,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SellpageStatus } from '@prisma/client';

export class CreateSellpageDto {
  @ApiProperty({ description: 'Store ID this sellpage belongs to' })
  @IsUUID()
  storeId: string;

  @ApiProperty({ description: 'Product ID for this sellpage' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'premium-shirt-offer' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug: string;

  @ApiPropertyOptional({ example: 'my-store' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  subdomain?: string;

  @ApiPropertyOptional({ example: 'offer.mystore.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customDomain?: string;

  @ApiPropertyOptional({ example: 'Buy Now - Limited Offer!' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleOverride?: string;

  @ApiPropertyOptional({ example: 'Get this amazing product at a special price' })
  @IsOptional()
  @IsString()
  descriptionOverride?: string;

  @ApiPropertyOptional({ example: 'SEO Title for Product' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'SEO description for this product page' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/og-image.jpg' })
  @IsOptional()
  @IsUrl()
  seoOgImage?: string;

  @ApiPropertyOptional({ description: 'Page sections JSON config' })
  @IsOptional()
  @IsArray()
  sections?: any[];

  @ApiPropertyOptional({ description: 'Header configuration' })
  @IsOptional()
  @IsObject()
  headerConfig?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Footer configuration' })
  @IsOptional()
  @IsObject()
  footerConfig?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Boost modules JSON config' })
  @IsOptional()
  @IsArray()
  boostModules?: any[];

  @ApiPropertyOptional({ description: 'Discount rules JSON config' })
  @IsOptional()
  @IsArray()
  discountRules?: any[];

  @ApiPropertyOptional({ description: 'Assigned team member ID' })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({ enum: SellpageStatus, default: 'DRAFT' })
  @IsOptional()
  @IsEnum(SellpageStatus)
  status?: SellpageStatus;
}
