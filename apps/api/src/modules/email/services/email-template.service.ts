import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TemplateRendererUtil } from '../utils/template-renderer.util';
import type { EmailTemplateType } from '@prisma/client';

@Injectable()
export class EmailTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templateRenderer: TemplateRendererUtil,
  ) {}

  /**
   * Creates a new email template
   */
  async createTemplate(data: {
    storeId: string;
    templateType: EmailTemplateType;
    subject: string;
    bodyHtml: string;
    bodyText?: string;
  }) {
    return this.prisma.emailTemplate.create({
      data: {
        storeId: data.storeId,
        templateType: data.templateType,
        subject: data.subject,
        bodyHtml: data.bodyHtml,
        bodyText: data.bodyText,
        isActive: true,
      },
    });
  }

  /**
   * Gets all email templates for a store
   */
  async getTemplates(storeId: string) {
    return this.prisma.emailTemplate.findMany({
      where: { storeId },
      orderBy: { templateType: 'asc' },
    });
  }

  /**
   * Gets a specific template by type
   */
  async getTemplateByType(storeId: string, templateType: EmailTemplateType) {
    return this.prisma.emailTemplate.findUnique({
      where: {
        storeId_templateType: {
          storeId,
          templateType,
        },
      },
    });
  }

  /**
   * Updates an email template
   */
  async updateTemplate(
    id: string,
    data: {
      subject?: string;
      bodyHtml?: string;
      bodyText?: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.emailTemplate.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes an email template
   */
  async deleteTemplate(id: string) {
    return this.prisma.emailTemplate.delete({
      where: { id },
    });
  }

  /**
   * Renders a template with data
   */
  async renderTemplate(
    storeId: string,
    templateType: EmailTemplateType,
    data: Record<string, any>,
  ): Promise<{ subject: string; bodyHtml: string; bodyText?: string }> {
    const template = await this.getTemplateByType(storeId, templateType);

    if (!template || !template.isActive) {
      throw new Error(
        `No active template found for type ${templateType} in store ${storeId}`,
      );
    }

    return {
      subject: this.templateRenderer.render(template.subject, data),
      bodyHtml: this.templateRenderer.renderUnsafe(template.bodyHtml, data),
      bodyText: template.bodyText
        ? this.templateRenderer.render(template.bodyText, data)
        : undefined,
    };
  }

  /**
   * Seeds default templates for a store
   */
  async seedDefaultTemplates(storeId: string, storeName: string) {
    const templates = [
      {
        templateType: 'ORDER_CONFIRMATION' as EmailTemplateType,
        subject: 'Order Confirmation - {{orderNumber}}',
        bodyHtml: this.getOrderConfirmationTemplate(),
        bodyText: 'Thank you for your order! Your order number is {{orderNumber}}.',
      },
      {
        templateType: 'ABANDONED_CART_1H' as EmailTemplateType,
        subject: 'Did you forget something?',
        bodyHtml: this.getAbandonedCart1HTemplate(),
        bodyText: 'You left items in your cart. Complete your purchase now!',
      },
      {
        templateType: 'ABANDONED_CART_24H' as EmailTemplateType,
        subject: 'Your cart is waiting for you',
        bodyHtml: this.getAbandonedCart24HTemplate(),
        bodyText: 'Your cart items are still available. Complete your order today!',
      },
      {
        templateType: 'ABANDONED_CART_7D' as EmailTemplateType,
        subject: 'Last chance - Your cart expires soon!',
        bodyHtml: this.getAbandonedCart7DTemplate(),
        bodyText: 'Your cart will expire soon. Complete your order before it\'s too late!',
      },
    ];

    for (const template of templates) {
      await this.prisma.emailTemplate.upsert({
        where: {
          storeId_templateType: {
            storeId,
            templateType: template.templateType,
          },
        },
        create: {
          storeId,
          ...template,
        },
        update: {
          subject: template.subject,
          bodyHtml: template.bodyHtml,
          bodyText: template.bodyText,
        },
      });
    }
  }

  /**
   * Default order confirmation template
   */
  private getOrderConfirmationTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #8e5303; margin: 0;">Order Confirmed!</h1>
        </div>

        <p>Hi {{customerName}},</p>

        <p>Thank you for your order! We've received your payment and are processing your order.</p>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> {{orderNumber}}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> {{orderDate}}</p>
          <p style="margin: 5px 0;"><strong>Total:</strong> {{total}}</p>
        </div>

        <h2 style="color: #8e5303;">Order Details</h2>
        {{items}}

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Summary</h3>
          <table width="100%" cellpadding="5" style="border-collapse: collapse;">
            <tr>
              <td>Subtotal:</td>
              <td align="right">{{subtotal}}</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td align="right">{{shippingCost}}</td>
            </tr>
            <tr>
              <td>Tax:</td>
              <td align="right">{{taxAmount}}</td>
            </tr>
            <tr style="border-top: 2px solid #333; font-weight: bold;">
              <td style="padding-top: 10px;">Total:</td>
              <td align="right" style="padding-top: 10px;">{{total}}</td>
            </tr>
          </table>
        </div>

        <p>You will receive another email when your order ships.</p>

        <p>If you have any questions, please don't hesitate to contact us.</p>

        <p>Best regards,<br>{{storeName}}</p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          <a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a> from marketing emails
        </p>
      </body>
      </html>
    `;
  }

  /**
   * Default abandoned cart 1H template
   */
  private getAbandonedCart1HTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #8e5303; margin: 0;">Did you forget something?</h1>
        </div>

        <p>Hi there,</p>

        <p>You left some items in your cart. Don't worry, we saved them for you!</p>

        <h2 style="color: #8e5303;">Your Cart Items</h2>
        {{items}}

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{recoveryUrl}}" style="background-color: #8e5303; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Complete Your Order
          </a>
        </div>

        <p>Your cart will be saved for the next 7 days.</p>

        <p>Best regards,<br>{{storeName}}</p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          <a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a> from marketing emails
        </p>
      </body>
      </html>
    `;
  }

  /**
   * Default abandoned cart 24H template
   */
  private getAbandonedCart24HTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #8e5303; margin: 0;">Your cart is waiting for you</h1>
        </div>

        <p>Hi there,</p>

        <p>Your items are still in your cart and ready for checkout!</p>

        {{#if discountCode}}
        <div style="background-color: #fff3cd; border: 2px dashed #8e5303; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin-top: 0; color: #8e5303;">Special Offer Just For You!</h3>
          <p style="font-size: 18px; margin: 10px 0;">Use code <strong style="font-size: 24px; color: #8e5303;">{{discountCode}}</strong></p>
          <p style="margin-bottom: 0;">for {{discountPercentage}}% off your order!</p>
        </div>
        {{/if}}

        <h2 style="color: #8e5303;">Your Cart Items</h2>
        {{items}}

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{recoveryUrl}}" style="background-color: #8e5303; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Complete Your Order Now
          </a>
        </div>

        <p>Best regards,<br>{{storeName}}</p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          <a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a> from marketing emails
        </p>
      </body>
      </html>
    `;
  }

  /**
   * Default abandoned cart 7D template
   */
  private getAbandonedCart7DTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #8e5303;">
          <h1 style="color: #8e5303; margin: 0;">Last Chance - Your Cart Expires Soon!</h1>
        </div>

        <p>Hi there,</p>

        <p><strong>Your cart will expire in 24 hours.</strong> Complete your order now before it's too late!</p>

        {{#if discountCode}}
        <div style="background-color: #fff3cd; border: 2px dashed #8e5303; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin-top: 0; color: #8e5303;">Final Offer!</h3>
          <p style="font-size: 18px; margin: 10px 0;">Use code <strong style="font-size: 24px; color: #8e5303;">{{discountCode}}</strong></p>
          <p style="margin-bottom: 0;">for {{discountPercentage}}% off your order!</p>
        </div>
        {{/if}}

        <h2 style="color: #8e5303;">Your Cart Items</h2>
        {{items}}

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{recoveryUrl}}" style="background-color: #8e5303; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Complete Your Order Now
          </a>
        </div>

        <p style="font-style: italic; color: #666;">This is your final reminder. After this, your cart will be cleared.</p>

        <p>Best regards,<br>{{storeName}}</p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          <a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a> from marketing emails
        </p>
      </body>
      </html>
    `;
  }
}
