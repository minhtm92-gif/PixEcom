import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentWorkspace } from '../../common/decorators/workspace.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Workspaces')
@ApiBearerAuth()
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: "List current user's workspaces" })
  findAll(@CurrentUser('id') userId: string) {
    return this.workspacesService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new workspace (auto OWNER membership)' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(userId, dto);
  }

  @Get(':id')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'Get workspace by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workspacesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update workspace' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete workspace (owner only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workspacesService.remove(id);
  }

  // ── Members sub-routes ────────────────────────────────

  @Get(':id/members')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List workspace members' })
  findMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.workspacesService.findMembers(id);
  }

  @Post(':id/members')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Add member to workspace' })
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { userId: string; role?: MemberRole },
  ) {
    return this.workspacesService.addMember(id, body.userId, body.role);
  }

  @Patch(':id/members/:memberId')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update member role' })
  updateMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() body: { role: MemberRole },
  ) {
    return this.workspacesService.updateMember(id, memberId, body.role);
  }

  @Delete(':id/members/:memberId')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove member from workspace' })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.workspacesService.removeMember(id, memberId);
  }
}
