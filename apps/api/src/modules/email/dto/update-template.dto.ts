import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateEmailTemplateDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  bodyHtml?: string;

  @IsString()
  @IsOptional()
  bodyText?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
