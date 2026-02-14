import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private emailService: any; // Lazy-loaded to avoid circular dependency

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ── Provider CRUD ─────────────────────────────────────

  async findAll(workspaceId: string) {
    const providers = await this.prisma.paymentProvider.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        providerType: true,
        displayName: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
        // Never expose credentialsEnc in list
      },
    });

    return providers;
  }

  async create(
    workspaceId: string,
    data: {
      providerType: string;
      displayName: string;
      credentials: Record<string, any>;
      isDefault?: boolean;
    },
  ) {
    const supportedProviders = ['stripe', 'paypal', 'tazapay'];
    if (!supportedProviders.includes(data.providerType.toLowerCase())) {
      throw new BadRequestException(
        `Unsupported provider type. Supported: ${supportedProviders.join(', ')}`,
      );
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.paymentProvider.updateMany({
        where: { workspaceId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Encrypt credentials (simple JSON stringify for now; in production use proper encryption)
    const credentialsEnc = Buffer.from(JSON.stringify(data.credentials)).toString('base64');

    const provider = await this.prisma.paymentProvider.create({
      data: {
        workspaceId,
        providerType: data.providerType.toLowerCase(),
        displayName: data.displayName,
        credentialsEnc,
        isDefault: data.isDefault || false,
      },
      select: {
        id: true,
        providerType: true,
        displayName: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
      },
    });

    return provider;
  }

  async update(
    workspaceId: string,
    providerId: string,
    data: {
      displayName?: string;
      credentials?: Record<string, any>;
      isActive?: boolean;
      isDefault?: boolean;
    },
  ) {
    const provider = await this.prisma.paymentProvider.findFirst({
      where: { id: providerId, workspaceId },
    });

    if (!provider) {
      throw new NotFoundException('Payment provider not found');
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.paymentProvider.updateMany({
        where: { workspaceId, isDefault: true, id: { not: providerId } },
        data: { isDefault: false },
      });
    }

    const updateData: any = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;
    if (data.credentials) {
      updateData.credentialsEnc = Buffer.from(JSON.stringify(data.credentials)).toString('base64');
    }

    return this.prisma.paymentProvider.update({
      where: { id: providerId },
      data: updateData,
      select: {
        id: true,
        providerType: true,
        displayName: true,
        isActive: true,
        isDefault: true,
        updatedAt: true,
      },
    });
  }

  async remove(workspaceId: string, providerId: string) {
    const provider = await this.prisma.paymentProvider.findFirst({
      where: { id: providerId, workspaceId },
    });

    if (!provider) {
      throw new NotFoundException('Payment provider not found');
    }

    await this.prisma.paymentProvider.delete({
      where: { id: providerId },
    });
  }

  // ── Webhook Handlers ──────────────────────────────────

  async handleStripeWebhook(rawBody: Buffer | undefined, signature: string) {
    this.logger.log('Received Stripe webhook');

    if (!rawBody || !signature) {
      throw new BadRequestException('Missing request body or stripe-signature header');
    }

    // In production, verify the webhook signature using Stripe's library:
    // const event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);

    try {
      const payload = JSON.parse(rawBody.toString());
      const eventType = payload.type;

      switch (eventType) {
        case 'checkout.session.completed':
        case 'payment_intent.succeeded': {
          const paymentId = payload.data?.object?.id;
          const metadata = payload.data?.object?.metadata;

          if (metadata?.orderId) {
            await this.updateOrderPaymentStatus(
              metadata.orderId,
              paymentId,
              'stripe',
              OrderStatus.CONFIRMED,
            );
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const metadata = payload.data?.object?.metadata;
          if (metadata?.orderId) {
            this.logger.warn(`Stripe payment failed for order ${metadata.orderId}`);
          }
          break;
        }

        case 'charge.refunded': {
          const metadata = payload.data?.object?.metadata;
          if (metadata?.orderId) {
            await this.updateOrderPaymentStatus(
              metadata.orderId,
              null,
              'stripe',
              OrderStatus.REFUNDED,
            );
          }
          break;
        }

        default:
          this.logger.log(`Unhandled Stripe event type: ${eventType}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Error processing Stripe webhook', error);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  async handlePaypalWebhook(body: any, headers: Record<string, string>) {
    this.logger.log('Received PayPal webhook');

    // In production, verify the webhook using PayPal's verification API
    try {
      const eventType = body.event_type;

      switch (eventType) {
        case 'CHECKOUT.ORDER.APPROVED':
        case 'PAYMENT.CAPTURE.COMPLETED': {
          const resource = body.resource;
          const orderId = resource?.purchase_units?.[0]?.custom_id;

          if (orderId) {
            await this.updateOrderPaymentStatus(
              orderId,
              resource.id,
              'paypal',
              OrderStatus.CONFIRMED,
            );
          }
          break;
        }

        case 'PAYMENT.CAPTURE.REFUNDED': {
          const resource = body.resource;
          const orderId = resource?.purchase_units?.[0]?.custom_id;

          if (orderId) {
            await this.updateOrderPaymentStatus(
              orderId,
              null,
              'paypal',
              OrderStatus.REFUNDED,
            );
          }
          break;
        }

        default:
          this.logger.log(`Unhandled PayPal event type: ${eventType}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Error processing PayPal webhook', error);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  async handleTazapayWebhook(body: any, headers: Record<string, string>) {
    this.logger.log('Received Tazapay webhook');

    // In production, verify the webhook signature from Tazapay
    try {
      const eventType = body.event;
      const data = body.data;

      switch (eventType) {
        case 'payment.completed': {
          const orderId = data?.reference_id;
          if (orderId) {
            await this.updateOrderPaymentStatus(
              orderId,
              data.transaction_id,
              'tazapay',
              OrderStatus.CONFIRMED,
            );
          }
          break;
        }

        case 'payment.failed': {
          const orderId = data?.reference_id;
          if (orderId) {
            this.logger.warn(`Tazapay payment failed for order ${orderId}`);
          }
          break;
        }

        case 'refund.completed': {
          const orderId = data?.reference_id;
          if (orderId) {
            await this.updateOrderPaymentStatus(
              orderId,
              null,
              'tazapay',
              OrderStatus.REFUNDED,
            );
          }
          break;
        }

        default:
          this.logger.log(`Unhandled Tazapay event type: ${eventType}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Error processing Tazapay webhook', error);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  // ── Private helpers ───────────────────────────────────

  private async updateOrderPaymentStatus(
    orderId: string,
    paymentId: string | null,
    paymentMethod: string,
    status: OrderStatus,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      this.logger.warn(`Webhook referenced non-existent order: ${orderId}`);
      return;
    }

    const updateData: any = { status, paymentMethod };
    if (paymentId) updateData.paymentId = paymentId;
    if (status === OrderStatus.CONFIRMED) updateData.paidAt = new Date();

    await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    this.logger.log(`Order ${orderId} updated to ${status} via ${paymentMethod}`);

    // Send order confirmation email when order is confirmed
    if (status === OrderStatus.CONFIRMED) {
      try {
        // Lazy-load EmailService to avoid circular dependency
        if (!this.emailService) {
          const { EmailService } = await import('../email/services/email.service');
          const { EmailQueueService } = await import('../email/services/email-queue.service');
          const { EmailTemplateService } = await import('../email/services/email-template.service');
          const { TemplateRendererUtil } = await import('../email/utils/template-renderer.util');

          const templateRenderer = new TemplateRendererUtil();
          const emailQueueService = new EmailQueueService(this.prisma, null as any);
          const emailTemplateService = new EmailTemplateService(this.prisma, templateRenderer);
          this.emailService = new EmailService(this.prisma, emailQueueService, emailTemplateService, templateRenderer);
        }

        await this.emailService.sendOrderConfirmation(orderId);
        this.logger.log(`Order confirmation email queued for order ${orderId}`);
      } catch (error) {
        this.logger.error(`Failed to send order confirmation email: ${error.message}`);
      }

      // Mark cart as recovered if it was from abandoned cart
      if (order.customerEmail) {
        try {
          // Find cart abandonment by email
          const cart = await this.prisma.cart.findFirst({
            where: {
              customerEmail: order.customerEmail,
              storeId: order.storeId,
            },
            include: {
              abandonment: true,
            },
          });

          if (cart?.abandonment && !cart.abandonment.isRecovered) {
            await this.prisma.cartAbandonment.update({
              where: { id: cart.abandonment.id },
              data: {
                isRecovered: true,
                recoveredAt: new Date(),
                recoveredOrderId: orderId,
              },
            });

            // Cancel pending abandoned cart emails
            if (order.storeId) {
              await this.prisma.emailMessage.updateMany({
                where: {
                  storeId: order.storeId,
                  relatedCartId: cart.id,
                  status: 'PENDING',
                },
                data: {
                  status: 'CANCELLED',
                },
              });
            }

            this.logger.log(`Marked cart ${cart.id} as recovered with order ${orderId}`);
          }
        } catch (error) {
          this.logger.error(`Failed to mark cart as recovered: ${error.message}`);
        }
      }
    }
  }
}
