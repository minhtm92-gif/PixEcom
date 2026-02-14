import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailQueueService } from './email-queue.service';
import { EmailTemplateService } from './email-template.service';
import { TemplateRendererUtil } from '../utils/template-renderer.util';
import { generateRecoveryToken } from '../utils/token.util';
import type { EmailTemplateType } from '@prisma/client';

@Injectable()
export class AbandonedCartService {
  private readonly logger = new Logger(AbandonedCartService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailQueueService: EmailQueueService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly templateRenderer: TemplateRendererUtil,
  ) {}

  /**
   * Tracks a cart as abandoned
   */
  async trackAbandonment(cart: any) {
    if (!cart.customerEmail) {
      this.logger.warn(`Cart ${cart.id} has no customer email, skipping`);
      return null;
    }

    // Check if already tracked
    const existing = await this.prisma.cartAbandonment.findUnique({
      where: { cartId: cart.id },
    });

    if (existing) {
      this.logger.log(`Cart ${cart.id} already tracked as abandoned`);
      return existing;
    }

    // Generate recovery token
    const { token, hash } = generateRecoveryToken();

    const abandonment = await this.prisma.cartAbandonment.create({
      data: {
        cartId: cart.id,
        customerEmail: cart.customerEmail,
        recoveryToken: token,
        recoveryTokenHash: hash,
        abandonedAt: cart.lastActivityAt || new Date(),
      },
    });

    this.logger.log(
      `Tracked cart ${cart.id} as abandoned for ${cart.customerEmail}`,
    );

    return abandonment;
  }

  /**
   * Schedules abandoned cart emails based on automation rules
   */
  async scheduleEmails(abandonment: any) {
    // Load cart with items
    const cart = await this.prisma.cart.findUnique({
      where: { id: abandonment.cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    media: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || !cart.storeId) {
      this.logger.warn(
        `Cart ${abandonment.cartId} not found or has no store, skipping`,
      );
      return;
    }

    // Get active automations for this store
    const automations = await this.prisma.emailAutomation.findMany({
      where: {
        storeId: cart.storeId,
        isActive: true,
        templateType: {
          in: [
            'ABANDONED_CART_1H',
            'ABANDONED_CART_24H',
            'ABANDONED_CART_7D',
          ],
        },
      },
      orderBy: { triggerDelayMinutes: 'asc' },
    });

    if (automations.length === 0) {
      this.logger.log(`No active abandoned cart automations for store ${cart.storeId}`);
      return;
    }

    for (const automation of automations) {
      // Check if this email was already sent
      const alreadySent = await this.prisma.emailMessage.findFirst({
        where: {
          storeId: cart.storeId,
          relatedCartId: cart.id,
          templateType: automation.templateType,
        },
      });

      if (alreadySent) {
        this.logger.log(
          `Email ${automation.templateType} already sent for cart ${cart.id}`,
        );
        continue;
      }

      // Calculate scheduled time
      const scheduledFor = new Date(
        abandonment.abandonedAt.getTime() +
          automation.triggerDelayMinutes * 60 * 1000,
      );

      // Skip if scheduled time is in the past and email count suggests it should have been sent
      const now = new Date();
      if (scheduledFor < now && abandonment.emailsSentCount > 0) {
        continue;
      }

      // Get store info
      const store = await this.prisma.store.findUnique({
        where: { id: cart.storeId },
      });

      if (!store) continue;

      // Build recovery URL
      const recoveryUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/email/cart-recovery/${abandonment.recoveryToken}`;

      // Build unsubscribe URL (TODO: implement unsubscribe token)
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/email/unsubscribe`;

      // Calculate cart total
      let cartTotal = 0;
      for (const item of cart.items) {
        const price =
          item.variant?.priceOverride || item.variant?.product?.basePrice || 0;
        cartTotal += Number(price) * item.quantity;
      }

      // Render template
      const templateData = {
        storeName: store.name,
        items: this.templateRenderer.renderCartItems(cart.items),
        recoveryUrl,
        unsubscribeUrl,
        discountCode: automation.discountCode || '',
        discountPercentage: automation.discountPercentage || 0,
        cartTotal: this.templateRenderer.formatCurrency(
          cartTotal,
          store.currency,
        ),
      };

      const rendered = await this.emailTemplateService.renderTemplate(
        cart.storeId,
        automation.templateType as EmailTemplateType,
        templateData,
      );

      // Queue the email
      await this.emailQueueService.queueEmail({
        storeId: cart.storeId,
        recipientEmail: cart.customerEmail!,
        subject: rendered.subject,
        bodyHtml: rendered.bodyHtml,
        bodyText: rendered.bodyText,
        templateType: automation.templateType,
        relatedCartId: cart.id,
        scheduledFor,
      });

      this.logger.log(
        `Scheduled ${automation.templateType} email for cart ${cart.id} at ${scheduledFor}`,
      );
    }
  }

  /**
   * Recovers a cart using recovery token
   */
  async recoverCart(token: string) {
    const { hashToken } = await import('../utils/token.util');
    const tokenHash = hashToken(token);

    const abandonment = await this.prisma.cartAbandonment.findUnique({
      where: { recoveryTokenHash: tokenHash },
      include: {
        cart: true,
      },
    });

    if (!abandonment) {
      throw new NotFoundException('Invalid or expired recovery token');
    }

    // Check if cart is still valid (not expired, less than 7 days old)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (abandonment.abandonedAt < sevenDaysAgo) {
      throw new NotFoundException('Recovery link has expired');
    }

    // Check if already recovered
    if (abandonment.isRecovered) {
      this.logger.log(`Cart ${abandonment.cartId} already recovered`);
      // Still return cart for recovery flow
    }

    return {
      cart: abandonment.cart,
      abandonment,
    };
  }

  /**
   * Marks a cart as recovered when order is placed
   */
  async markAsRecovered(cartId: string, orderId: string) {
    const abandonment = await this.prisma.cartAbandonment.findUnique({
      where: { cartId },
    });

    if (!abandonment) {
      return;
    }

    // Update abandonment record
    await this.prisma.cartAbandonment.update({
      where: { cartId },
      data: {
        isRecovered: true,
        recoveredAt: new Date(),
        recoveredOrderId: orderId,
      },
    });

    // Cancel pending abandoned cart emails
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      select: { storeId: true },
    });

    if (cart && cart.storeId) {
      await this.emailQueueService.cancelPendingEmails({
        storeId: cart.storeId,
        relatedCartId: cartId,
      });
    }

    this.logger.log(
      `Marked cart ${cartId} as recovered with order ${orderId}`,
    );
  }

  /**
   * Detects abandoned carts and tracks them
   */
  async detectAbandonedCarts(batchSize: number = 100): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Find carts that:
    // 1. Have customer email
    // 2. Last activity was more than 1 hour ago
    // 3. Not already tracked as abandoned
    // 4. Not expired
    const carts = await this.prisma.cart.findMany({
      where: {
        customerEmail: { not: null },
        lastActivityAt: { lt: oneHourAgo },
        expiresAt: { gt: new Date() },
        abandonment: null,
      },
      include: {
        items: true,
      },
      take: batchSize,
    });

    this.logger.log(`Found ${carts.length} potentially abandoned carts`);

    let trackedCount = 0;

    for (const cart of carts) {
      // Check if cart was converted to an order
      const order = await this.prisma.order.findFirst({
        where: {
          customerEmail: cart.customerEmail!,
          storeId: cart.storeId,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Skip if there's a recent order from this email
      if (order && order.createdAt >= cart.lastActivityAt) {
        continue;
      }

      // Track as abandoned
      const abandonment = await this.trackAbandonment(cart);
      if (abandonment) {
        trackedCount++;

        // Schedule emails for this abandonment
        await this.scheduleEmails(abandonment);
      }
    }

    this.logger.log(`Tracked ${trackedCount} new abandoned carts`);
    return trackedCount;
  }
}
