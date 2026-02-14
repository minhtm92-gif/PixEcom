import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Matches } from 'class-validator';

export enum DomainVerificationMethod {
  TXT = 'TXT',
  A_RECORD = 'A_RECORD',
}

export class CreateDomainDto {
  @ApiProperty({
    example: 'mystore.com',
    description: 'The domain hostname to verify',
  })
  @IsString()
  @Matches(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/, {
    message: 'Invalid domain format',
  })
  hostname: string;

  @ApiProperty({
    enum: DomainVerificationMethod,
    example: DomainVerificationMethod.TXT,
    description: 'DNS verification method (TXT record or A record)',
  })
  @IsEnum(DomainVerificationMethod)
  verificationMethod: DomainVerificationMethod;
}
