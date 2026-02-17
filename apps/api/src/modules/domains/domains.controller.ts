import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DomainsService } from './domains.service';
import { DomainsSslService } from './domains-ssl.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentWorkspace } from '../../common/decorators/workspace.decorator';
import { MemberRole } from '@prisma/client';

@ApiTags('Domains')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard, RolesGuard)
@Controller('stores/:storeId/domains')
export class DomainsController {
  constructor(
    private readonly domainsService: DomainsService,
    private readonly sslService: DomainsSslService,
  ) {}

  @Post()
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Add a custom domain to a store' })
  @ApiResponse({ status: 201, description: 'Domain created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or domain already exists' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  create(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @CurrentWorkspace('id') workspaceId: string,
    @Body() createDomainDto: CreateDomainDto,
  ) {
    return this.domainsService.create(storeId, workspaceId, createDomainDto);
  }

  @Get()
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List all domains for a store' })
  @ApiResponse({ status: 200, description: 'Domains retrieved successfully' })
  findAll(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @CurrentWorkspace('id') workspaceId: string,
  ) {
    return this.domainsService.findAll(storeId, workspaceId);
  }

  @Get(':domainId')
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'Get a specific domain by ID' })
  @ApiResponse({ status: 200, description: 'Domain retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  findOne(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Param('domainId', ParseUUIDPipe) domainId: string,
    @CurrentWorkspace('id') workspaceId: string,
  ) {
    return this.domainsService.findOne(domainId, storeId, workspaceId);
  }

  @Post(':domainId/verify')
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Manually trigger domain verification' })
  @ApiResponse({ status: 200, description: 'Verification check completed' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  verify(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Param('domainId', ParseUUIDPipe) domainId: string,
    @CurrentWorkspace('id') workspaceId: string,
  ) {
    return this.domainsService.verify(domainId, storeId, workspaceId);
  }

  @Patch(':domainId')
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update domain settings (set primary, toggle active)' })
  @ApiResponse({ status: 200, description: 'Domain updated successfully' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  update(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Param('domainId', ParseUUIDPipe) domainId: string,
    @CurrentWorkspace('id') workspaceId: string,
    @Body() updateDomainDto: UpdateDomainDto,
  ) {
    return this.domainsService.update(
      domainId,
      storeId,
      workspaceId,
      updateDomainDto,
    );
  }

  @Post(':domainId/provision-ssl')
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Manually trigger SSL provisioning for a verified domain' })
  @ApiResponse({ status: 200, description: 'SSL provisioning triggered' })
  @ApiResponse({ status: 400, description: 'Domain must be verified first' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  async provisionSsl(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Param('domainId', ParseUUIDPipe) domainId: string,
    @CurrentWorkspace('id') workspaceId: string,
  ) {
    const domain = await this.domainsService.findOne(domainId, storeId, workspaceId);

    if (domain.status !== 'VERIFIED') {
      throw new BadRequestException(
        'Domain must be verified before SSL can be provisioned',
      );
    }

    return this.sslService.provisionSsl(domainId);
  }

  @Delete(':domainId')
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a domain from a store' })
  @ApiResponse({ status: 204, description: 'Domain deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete primary domain' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  remove(
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Param('domainId', ParseUUIDPipe) domainId: string,
    @CurrentWorkspace('id') workspaceId: string,
  ) {
    return this.domainsService.remove(domainId, storeId, workspaceId);
  }
}
