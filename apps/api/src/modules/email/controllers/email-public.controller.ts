import {
  Controller,
  Get,
  Param,
  Res,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { AbandonedCartService } from '../services/abandoned-cart.service';
import { PrismaService } from '../../../prisma/prisma.service';

@ApiTags('Email (Public)')
@Controller('email')
export class EmailPublicController {
  constructor(
    private readonly abandonedCartService: AbandonedCartService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Cart recovery endpoint
   * Restores cart session and redirects to checkout
   */
  @Public()
  @Get('cart-recovery/:token')
  async recoverCart(
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    try {
      const { cart } = await this.abandonedCartService.recoverCart(token);

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      // Set cart session cookie
      res.cookie('cart_session', cart.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Redirect to checkout
      const frontendUrl =
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/checkout`);
    } catch (error) {
      // Redirect to home page on error
      const frontendUrl =
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}?error=invalid_recovery_link`);
    }
  }

  /**
   * Unsubscribe endpoint
   * Marks email as unsubscribed
   */
  @Public()
  @Get('unsubscribe')
  async unsubscribe(
    @Query('token') token: string,
    @Query('email') email: string,
    @Query('storeId') storeId: string,
    @Res() res: Response,
  ) {
    try {
      if (!email || !storeId) {
        throw new NotFoundException('Invalid unsubscribe link');
      }

      // Create or update subscription record
      await this.prisma.emailSubscription.upsert({
        where: {
          storeId_email: {
            storeId,
            email,
          },
        },
        create: {
          storeId,
          email,
          isUnsubscribed: true,
          unsubscribedAt: new Date(),
          unsubscribeToken: token || '',
        },
        update: {
          isUnsubscribed: true,
          unsubscribedAt: new Date(),
        },
      });

      // Return HTML confirmation page
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed Successfully</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
            }
            .success-icon {
              font-size: 64px;
              color: #28a745;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              font-size: 28px;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              font-size: 16px;
              line-height: 1.6;
            }
            a {
              color: #8e5303;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="success-icon">✓</div>
          <h1>You've been unsubscribed</h1>
          <p>You will no longer receive marketing emails at <strong>${email}</strong>.</p>
          <p>You will still receive transactional emails like order confirmations.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">Return to homepage</a></p>
        </body>
        </html>
      `;

      res.send(html);
    } catch (error) {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
            }
            .error-icon {
              font-size: 64px;
              color: #dc3545;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              font-size: 28px;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              font-size: 16px;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="error-icon">✕</div>
          <h1>Invalid unsubscribe link</h1>
          <p>This unsubscribe link is invalid or has expired.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">Return to homepage</a></p>
        </body>
        </html>
      `;

      res.send(html);
    }
  }
}
