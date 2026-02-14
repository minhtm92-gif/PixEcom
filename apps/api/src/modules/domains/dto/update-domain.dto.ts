import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDomainDto {
  @ApiPropertyOptional({
    description: 'Set this domain as the primary domain for the store',
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Enable or disable this domain',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
