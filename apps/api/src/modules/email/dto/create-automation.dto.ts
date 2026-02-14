import { IsEnum, IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { EmailTemplateType } from '@prisma/client';

export class CreateEmailAutomationDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(EmailTemplateType)
  templateType: EmailTemplateType;

  @IsNumber()
  @Min(1)
  triggerDelayMinutes: number;

  @IsString()
  @IsOptional()
  discountCode?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercentage?: number;
}
