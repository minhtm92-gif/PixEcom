import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Res,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Cart')
@Public()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current cart contents' })
  async getCart(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = this.getOrCreateSessionId(req, res);
    return this.cartService.getCart(sessionId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { variantId: string; quantity?: number; storeId?: string },
  ) {
    const sessionId = this.getOrCreateSessionId(req, res);
    return this.cartService.addItem(sessionId, body.variantId, body.quantity || 1, body.storeId);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() body: { quantity: number },
  ) {
    const sessionId = this.getOrCreateSessionId(req, res);
    return this.cartService.updateItem(sessionId, itemId, body.quantity);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    const sessionId = this.getOrCreateSessionId(req, res);
    return this.cartService.removeItem(sessionId, itemId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear entire cart' })
  async clearCart(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = this.getOrCreateSessionId(req, res);
    return this.cartService.clearCart(sessionId);
  }

  private getOrCreateSessionId(req: Request, res: Response): string {
    let sessionId = req.cookies?.['cart_session'];

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      res.cookie('cart_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    return sessionId;
  }
}
