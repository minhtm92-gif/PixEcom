import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class SendTestEmailDto {
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  body?: string;
}
