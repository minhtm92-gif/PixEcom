import { IsString, IsOptional, IsObject, IsBoolean } from 'class-validator';

export class UpdateEmailProviderDto {
  @IsString()
  @IsOptional()
  fromEmail?: string;

  @IsString()
  @IsOptional()
  fromName?: string;

  @IsString()
  @IsOptional()
  replyToEmail?: string;

  @IsObject()
  @IsOptional()
  credentials?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
