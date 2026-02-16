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
import { UsersService } from './users.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentWorkspace } from '../../common/decorators/workspace.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List users in the current workspace' })
  findAll(
    @CurrentWorkspace('id') workspaceId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(workspaceId, { page, limit, search });
  }

  @Post()
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user and add to workspace' })
  create(
    @CurrentWorkspace('id') workspaceId: string,
    @Body() body: { email: string; displayName: string; password: string; role?: MemberRole },
  ) {
    return this.usersService.create(workspaceId, body);
  }

  @Get('by-email/:email')
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Find user by email address' })
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.findOne(workspaceId, id);
  }

  @Patch(':id')
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update a user' })
  update(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { displayName?: string; avatarUrl?: string; isActive?: boolean },
  ) {
    return this.usersService.update(workspaceId, id, body);
  }

  @Delete(':id')
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove user from workspace' })
  remove(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.usersService.remove(workspaceId, id, currentUserId);
  }
}
