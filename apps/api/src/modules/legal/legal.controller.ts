import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { LegalService } from './legal.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentWorkspace } from '../../common/decorators/workspace.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Legal Policies')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard, RolesGuard)
@Controller('legal-policies')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get()
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List legal policies in workspace' })
  findAll(
    @CurrentWorkspace('id') workspaceId: string,
    @Query('policyType') policyType?: string,
  ) {
    return this.legalService.findAll(workspaceId, { policyType });
  }

  @Post()
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Create a legal policy' })
  create(
    @CurrentWorkspace('id') workspaceId: string,
    @Body()
    body: {
      title: string;
      slug: string;
      policyType: string;
      bodyHtml: string;
      isActive?: boolean;
    },
  ) {
    return this.legalService.create(workspaceId, body);
  }

  @Get(':id')
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'Get legal policy by ID' })
  findOne(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.legalService.findOne(workspaceId, id);
  }

  @Patch(':id')
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update a legal policy' })
  update(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: {
      title?: string;
      slug?: string;
      policyType?: string;
      bodyHtml?: string;
      isActive?: boolean;
    },
  ) {
    return this.legalService.update(workspaceId, id, body);
  }

  @Delete(':id')
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a legal policy' })
  remove(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.legalService.remove(workspaceId, id);
  }
}
