import { IsEnum, IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { EmailProviderType } from '@prisma/client';

export class CreateEmailProviderDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsEnum(EmailProviderType)
  providerType: EmailProviderType;

  @IsString()
  @IsNotEmpty()
  fromEmail: string;

  @IsString()
  @IsOptional()
  fromName?: string;

  @IsString()
  @IsOptional()
  replyToEmail?: string;

  @IsObject()
  @IsNotEmpty()
  credentials: Record<string, any>;
}
