import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { SellpagesService } from '../sellpages/sellpages.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Public')
@Public()
@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly sellpagesService: SellpagesService,
  ) {}

  @Get('store/:domain')
  @ApiOperation({ summary: 'Get public store info by domain' })
  getStoreByDomain(@Param('domain') domain: string) {
    return this.publicService.getStoreByDomain(domain);
  }

  @Get('store/:domain/homepage')
  @ApiOperation({ summary: 'Get public store homepage' })
  getStoreHomepage(@Param('domain') domain: string) {
    return this.publicService.getStoreHomepage(domain);
  }

  @Get('sellpage/:storeSlug/:slug')
  @ApiOperation({ summary: 'Get public sellpage by store slug and sellpage slug' })
  getSellpage(
    @Param('storeSlug') storeSlug: string,
    @Param('slug') slug: string,
  ) {
    return this.publicService.getSellpage(storeSlug, slug);
  }

  @Get('preview/:token')
  @ApiOperation({ summary: 'Get sellpage by preview token (for draft previews)' })
  getPreview(@Param('token') token: string) {
    return this.sellpagesService.getByPreviewToken(token);
  }

  @Get('stores/:storeSlug/sellpages/:sellpageSlug')
  @ApiOperation({ summary: 'Get public sellpage with product and reviews' })
  getSellpageWithData(
    @Param('storeSlug') storeSlug: string,
    @Param('sellpageSlug') sellpageSlug: string,
  ) {
    return this.publicService.getSellpageWithData(storeSlug, sellpageSlug);
  }
}
