import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { LegalSetsService } from './legal-sets.service';
import { CreateLegalSetDto } from './dto/create-legal-set.dto';
import { UpdateLegalSetDto } from './dto/update-legal-set.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../auth/guards/workspace.guard';

@Controller('legal-sets')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class LegalSetsController {
  constructor(private readonly legalSetsService: LegalSetsService) {}

  @Post()
  create(@Req() req, @Body() createLegalSetDto: CreateLegalSetDto) {
    return this.legalSetsService.create(req.workspaceId, createLegalSetDto);
  }

  @Post('default')
  createDefault(@Req() req) {
    return this.legalSetsService.createDefaultLegalSet(req.workspaceId);
  }

  @Get()
  findAll(@Req() req) {
    return this.legalSetsService.findAll(req.workspaceId);
  }

  @Get('default')
  findDefault(@Req() req) {
    return this.legalSetsService.findDefault(req.workspaceId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.legalSetsService.findOne(req.workspaceId, id);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() updateLegalSetDto: UpdateLegalSetDto) {
    return this.legalSetsService.update(req.workspaceId, id, updateLegalSetDto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.legalSetsService.remove(req.workspaceId, id);
  }

  @Post(':id/duplicate')
  duplicate(@Req() req, @Param('id') id: string, @Body('name') name?: string) {
    return this.legalSetsService.duplicate(req.workspaceId, id, name);
  }
}

@Controller('stores/:storeId/policies')
export class StorePoliciesController {
  constructor(private readonly legalSetsService: LegalSetsService) {}

  @Get()
  getStorePolicies(@Param('storeId') storeId: string) {
    return this.legalSetsService.getStorePolicies(storeId);
  }
}
