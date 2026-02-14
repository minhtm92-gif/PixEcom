import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Headers,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentWorkspace } from '../../common/decorators/workspace.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ── Payment Provider CRUD (authenticated) ─────────────

  @Get('payment-providers')
  @ApiBearerAuth()
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'List payment providers in workspace' })
  findAll(@CurrentWorkspace('id') workspaceId: string) {
    return this.paymentsService.findAll(workspaceId);
  }

  @Post('payment-providers')
  @ApiBearerAuth()
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Add a payment provider' })
  create(
    @CurrentWorkspace('id') workspaceId: string,
    @Body()
    body: {
      providerType: string;
      displayName: string;
      credentials: Record<string, any>;
      isDefault?: boolean;
    },
  ) {
    return this.paymentsService.create(workspaceId, body);
  }

  @Patch('payment-providers/:id')
  @ApiBearerAuth()
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update a payment provider' })
  update(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: {
      displayName?: string;
      credentials?: Record<string, any>;
      isActive?: boolean;
      isDefault?: boolean;
    },
  ) {
    return this.paymentsService.update(workspaceId, id, body);
  }

  @Delete('payment-providers/:id')
  @ApiBearerAuth()
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a payment provider' })
  remove(
    @CurrentWorkspace('id') workspaceId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.remove(workspaceId, id);
  }

  // ── Webhooks (public, no auth) ─────────────────────────

  @Post('webhooks/stripe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook' })
  handleStripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleStripeWebhook(req.rawBody, signature);
  }

  @Post('webhooks/paypal')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle PayPal webhook' })
  handlePaypal(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.paymentsService.handlePaypalWebhook(body, headers);
  }

  @Post('webhooks/tazapay')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Tazapay webhook' })
  handleTazapay(@Body() body: any, @Headers() headers: Record<string, string>) {
    return this.paymentsService.handleTazapayWebhook(body, headers);
  }
}
