import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MemberRole, OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentWorkspace } from '../../common/decorators/workspace.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List orders in workspace' })
  findAll(
    @CurrentWorkspace('id') workspaceId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('storeId') storeId?: string,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAll(workspaceId, { page, limit, status, storeId, search });
  }

  @Get('stats')
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'Get order statistics for workspace' })
  getStats(
    @CurrentWorkspace('id') workspaceId: string,
    @Query('storeId') storeId?: string,
    @Query('period') period?: string,
  ) {
    return this.ordersService.getStats(workspaceId, { storeId, period });
  }

  @Get(':id')
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.findOne(workspaceId, id);
  }

  @Patch(':id')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Update order (status, tracking, notes)' })
  update(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: {
      status?: OrderStatus;
      trackingNumber?: string;
      trackingUrl?: string;
      notes?: string;
    },
  ) {
    return this.ordersService.update(workspaceId, id, body);
  }
}
