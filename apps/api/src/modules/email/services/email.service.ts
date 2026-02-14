import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailQueueService } from './email-queue.service';
import { EmailTemplateService } from './email-template.service';
import { TemplateRendererUtil } from '../utils/template-renderer.util';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailQueueService: EmailQueueService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly templateRenderer: TemplateRendererUtil,
  ) {}

  /**
   * Sends an order confirmation email
   */
  async sendOrderConfirmation(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        store: true,
      },
    });

    if (!order || !order.store) {
      this.logger.error(`Order ${orderId} not found or has no store`);
      return;
    }

    // Check if email was already sent
    const existing = await this.prisma.emailMessage.findFirst({
      where: {
        relatedOrderId: orderId,
        templateType: 'ORDER_CONFIRMATION',
      },
    });

    if (existing) {
      this.logger.log(
        `Order confirmation email already sent for order ${orderId}`,
      );
      return existing;
    }

    // Build unsubscribe URL (TODO: implement unsubscribe token)
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/email/unsubscribe`;

    // Prepare template data
    const templateData = {
      storeName: order.store.name,
      customerName: order.customerName || 'Customer',
      orderNumber: order.orderNumber,
      orderDate: this.templateRenderer.formatDate(order.createdAt),
      items: this.templateRenderer.renderOrderItems(order.items),
      subtotal: this.templateRenderer.formatCurrency(
        Number(order.subtotal),
        order.currency,
      ),
      shippingCost: this.templateRenderer.formatCurrency(
        Number(order.shippingCost),
        order.currency,
      ),
      taxAmount: this.templateRenderer.formatCurrency(
        Number(order.taxAmount),
        order.currency,
      ),
      total: this.templateRenderer.formatCurrency(
        Number(order.total),
        order.currency,
      ),
      trackingUrl: order.trackingUrl || '',
      unsubscribeUrl,
    };

    // Render template
    const rendered = await this.emailTemplateService.renderTemplate(
      order.storeId!,
      'ORDER_CONFIRMATION',
      templateData,
    );

    // Queue the email for immediate sending
    const message = await this.emailQueueService.queueEmail({
      storeId: order.storeId!,
      recipientEmail: order.customerEmail,
      subject: rendered.subject,
      bodyHtml: rendered.bodyHtml,
      bodyText: rendered.bodyText,
      templateType: 'ORDER_CONFIRMATION',
      relatedOrderId: orderId,
      scheduledFor: new Date(), // Send immediately
    });

    this.logger.log(
      `Queued order confirmation email for order ${orderId}`,
    );

    return message;
  }

  /**
   * Sends a test email
   */
  async sendTestEmail(
    storeId: string,
    recipientEmail: string,
    subject?: string,
    body?: string,
  ) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new Error(`Store ${storeId} not found`);
    }

    const defaultSubject = subject || 'Test Email from PixEcom';
    const defaultBody =
      body ||
      `
      <h2>Test Email</h2>
      <p>This is a test email from ${store.name}.</p>
      <p>Your email configuration is working correctly!</p>
    `;

    const message = await this.emailQueueService.queueEmail({
      storeId,
      recipientEmail,
      subject: defaultSubject,
      bodyHtml: defaultBody,
      bodyText: 'This is a test email from PixEcom.',
      scheduledFor: new Date(),
    });

    // Process immediately
    await this.emailQueueService.processEmail(message.id);

    return message;
  }

  /**
   * Checks if an email is unsubscribed
   */
  async isUnsubscribed(storeId: string, email: string): Promise<boolean> {
    const subscription = await this.prisma.emailSubscription.findUnique({
      where: {
        storeId_email: {
          storeId,
          email,
        },
      },
    });

    return subscription?.isUnsubscribed || false;
  }
}
