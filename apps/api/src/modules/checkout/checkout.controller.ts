import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { CheckoutService } from './checkout.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Checkout')
@Public()
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate checkout from cart' })
  initiate(
    @Req() req: Request,
    @Body()
    body: {
      sessionId?: string;
      customerEmail: string;
      customerName?: string;
      customerPhone?: string;
      sellpageId?: string;
      storeId?: string;
    },
  ) {
    const sessionId = body.sessionId || req.cookies?.['cart_session'];
    return this.checkoutService.initiate(sessionId, body);
  }

  @Patch(':orderId/shipping')
  @ApiOperation({ summary: 'Add shipping address to order' })
  updateShipping(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body()
    body: {
      shippingAddress: {
        fullName: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone?: string;
      };
    },
  ) {
    return this.checkoutService.updateShipping(orderId, body.shippingAddress);
  }

  @Post(':orderId/payment')
  @ApiOperation({ summary: 'Process payment for an order' })
  processPayment(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body()
    body: {
      paymentMethod: string;
      paymentToken?: string;
      returnUrl?: string;
    },
  ) {
    return this.checkoutService.processPayment(orderId, body);
  }

  @Get(':orderId/status')
  @ApiOperation({ summary: 'Get order/checkout status' })
  getStatus(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.checkoutService.getStatus(orderId);
  }
}
