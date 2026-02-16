import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLegalPolicyDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  policyType: string;

  @IsString()
  bodyHtml: string;

  @IsOptional()
  @IsString()
  displayOrder?: number;
}

export class CreateLegalSetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLegalPolicyDto)
  policies?: CreateLegalPolicyDto[];
}
