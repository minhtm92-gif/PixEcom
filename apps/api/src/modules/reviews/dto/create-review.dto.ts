import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsUrl,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 'John Smith',
    description: 'Display name of the review author',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  authorName: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL for the review author',
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 5,
    description: 'Rating from 1 to 5 stars',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Great product! Highly recommend.',
    description: 'Review text content',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  body: string;

  @ApiPropertyOptional({
    example: '2025-01-15T10:30:00Z',
    description: 'Optional custom created date (for backdating reviews)',
  })
  @IsOptional()
  @IsDateString()
  createdAtOverride?: string;

  @ApiPropertyOptional({
    default: true,
    description: 'Whether the review is visible on the public site',
  })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
