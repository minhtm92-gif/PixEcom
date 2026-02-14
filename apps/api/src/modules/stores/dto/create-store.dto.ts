import {
  IsString,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
  IsHexColor,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ example: 'My Store' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'my-store' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug: string;

  @ApiProperty({ example: 'my-store.pixecom.io' })
  @IsString()
  @MaxLength(255)
  primaryDomain: string;

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
}
