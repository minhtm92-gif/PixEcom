import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DomainsService } from './domains.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Public - Domains')
@Controller('public/domains')
export class DomainsPublicController {
  constructor(private readonly domainsService: DomainsService) {}

  @Public()
  @Get(':hostname')
  @ApiOperation({
    summary: 'Look up a verified domain by hostname (public endpoint)',
  })
  @ApiResponse({
    status: 200,
    description: 'Domain found and verified',
  })
  @ApiResponse({
    status: 404,
    description: 'Domain not found or not verified',
  })
  findByHostname(@Param('hostname') hostname: string) {
    return this.domainsService.findByHostname(hostname);
  }
}
