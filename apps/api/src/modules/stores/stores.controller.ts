import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentWorkspace } from '../../common/decorators/workspace.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Stores')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard, RolesGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List stores in workspace' })
  findAll(
    @CurrentWorkspace('id') workspaceId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.storesService.findAll(workspaceId, { page, limit });
  }

  @Post()
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Create a new store' })
  create(
    @CurrentWorkspace('id') workspaceId: string,
    @Body() dto: CreateStoreDto,
  ) {
    return this.storesService.create(workspaceId, dto);
  }

  @Get(':storeId')
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'Get store by ID' })
  findOne(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ) {
    return this.storesService.findOne(workspaceId, storeId);
  }

  @Patch(':storeId')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Update store' })
  update(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.update(workspaceId, storeId, dto);
  }

  @Delete(':storeId')
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete store' })
  remove(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ) {
    return this.storesService.remove(workspaceId, storeId);
  }

  @Get(':storeId/homepage')
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'Get store homepage config' })
  getHomepage(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('storeId', ParseUUIDPipe) storeId: string,
  ) {
    return this.storesService.getHomepage(workspaceId, storeId);
  }

  @Put(':storeId/homepage')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Update store homepage config' })
  updateHomepage(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('storeId', ParseUUIDPipe) storeId: string,
    @Body() body: { homepageTitle?: string; homepageDescription?: string; homepageConfig?: any },
  ) {
    return this.storesService.updateHomepage(workspaceId, storeId, body);
  }
}
