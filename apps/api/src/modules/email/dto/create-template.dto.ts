import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { EmailTemplateType } from '@prisma/client';

export class CreateEmailTemplateDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsEnum(EmailTemplateType)
  templateType: EmailTemplateType;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  bodyHtml: string;

  @IsString()
  @IsOptional()
  bodyText?: string;
}
