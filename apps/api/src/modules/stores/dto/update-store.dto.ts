import {
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  IsHexColor,
  IsObject,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoreDto {
  @ApiPropertyOptional({ example: 'My Updated Store' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'my-updated-store' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'my-store.pixecom.io' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  primaryDomain?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/favicon.ico' })
  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @ApiPropertyOptional({ example: '#FF5733' })
  @IsOptional()
  @IsHexColor()
  brandColor?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  homepageTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homepageDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  themeConfig?: Record<string, any>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
