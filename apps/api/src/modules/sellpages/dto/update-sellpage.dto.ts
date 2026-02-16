import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  IsObject,
  MinLength,
  MaxLength,
  Matches,
  IsUrl,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSellpageDto {
  @ApiPropertyOptional({ example: 'updated-offer-slug' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug?: string;

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

  @ApiPropertyOptional({ example: 'Updated Title Override' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleOverride?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  descriptionOverride?: string;

  @ApiPropertyOptional({ example: 'SEO Title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'SEO description' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/og-image.jpg' })
  @IsOptional()
  @IsString()
  seoOgImage?: string;

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

  @ApiPropertyOptional({ example: 'offer.example.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sellpageDomain?: string;

  @ApiPropertyOptional({ example: '1234567890123456' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  facebookPixelId?: string;

  @ApiPropertyOptional({ example: 'ABC123DEF456' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tiktokPixelId?: string;

  @ApiPropertyOptional({ example: 'G-XXXXXXXXXX' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  googleAnalyticsId?: string;

  @ApiPropertyOptional({ example: 'GTM-XXXXXX' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  googleTagManagerId?: string;
}
