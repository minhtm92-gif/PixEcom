import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class ReorderMediaDto {
  @ApiProperty({
    type: [String],
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
      '323e4567-e89b-12d3-a456-426614174002',
    ],
    description: 'Array of media IDs in desired order',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  mediaIds: string[];
}
