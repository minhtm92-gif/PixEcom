import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DomainsVerificationService } from './domains-verification.service';

@ApiTags('Domains')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('domains')
export class DomainsInfoController {
  constructor(
    private readonly domainsVerificationService: DomainsVerificationService,
  ) {}

  @Get('expected-ip')
  @ApiOperation({ summary: 'Get the expected IP address for domain configuration' })
  @ApiResponse({
    status: 200,
    description: 'Expected IP address retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        expectedIp: { type: 'string', example: '139.59.243.200' },
      },
    },
  })
  getExpectedIp() {
    const expectedIp = this.domainsVerificationService.getExpectedIp();
    return { expectedIp };
  }
}
