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
import { MemberRole, SellpageStatus } from '@prisma/client';
import { SellpagesService } from './sellpages.service';
import { CreateSellpageDto } from './dto/create-sellpage.dto';
import { UpdateSellpageDto } from './dto/update-sellpage.dto';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentWorkspace } from '../../common/decorators/workspace.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Sellpages')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard, RolesGuard)
@Controller('sellpages')
export class SellpagesController {
  constructor(private readonly sellpagesService: SellpagesService) {}

  @Get()
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List sellpages in workspace' })
  findAll(
    @CurrentWorkspace('id') workspaceId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('storeId') storeId?: string,
    @Query('status') status?: string,
  ) {
    return this.sellpagesService.findAll(workspaceId, { page, limit, storeId, status });
  }

  @Post()
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Create a new sellpage' })
  create(
    @CurrentWorkspace('id') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSellpageDto,
  ) {
    return this.sellpagesService.create(workspaceId, userId, dto);
  }

  @Get(':id')
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'Get sellpage by ID' })
  findOne(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sellpagesService.findOne(workspaceId, id);
  }

  @Patch(':id')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Update sellpage' })
  update(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSellpageDto,
  ) {
    return this.sellpagesService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete sellpage' })
  remove(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sellpagesService.remove(workspaceId, id);
  }

  @Patch(':id/sections')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Update sellpage sections' })
  updateSections(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { sections: any[] },
  ) {
    return this.sellpagesService.updateSections(workspaceId, id, body.sections);
  }

  @Patch(':id/publish')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Publish or unpublish a sellpage' })
  publish(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: SellpageStatus },
  ) {
    return this.sellpagesService.changeStatus(workspaceId, id, body.status);
  }

  @Post(':id/preview-token')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Generate a preview token for a sellpage' })
  createPreviewToken(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) sellpageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.sellpagesService.createPreviewToken(workspaceId, sellpageId, userId);
  }

  @Get(':id/preview-tokens')
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List active preview tokens for a sellpage' })
  listPreviewTokens(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) sellpageId: string,
  ) {
    return this.sellpagesService.listPreviewTokens(workspaceId, sellpageId);
  }

  @Delete(':id/preview-tokens/:tokenId')
  @Roles(MemberRole.EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a preview token' })
  deletePreviewToken(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) sellpageId: string,
    @Param('tokenId', ParseUUIDPipe) tokenId: string,
  ) {
    return this.sellpagesService.deletePreviewToken(workspaceId, sellpageId, tokenId);
  }
}
