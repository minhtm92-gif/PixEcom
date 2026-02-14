import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailProviderService } from './email-provider.service';
import { EmailMessageStatus } from '@prisma/client';

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);
  private readonly maxRetries = 3;
  private readonly retryDelays = [60000, 300000, 1800000]; // 1min, 5min, 30min

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailProviderService: EmailProviderService,
  ) {}

  /**
   * Queues an email for sending
   */
  async queueEmail(data: {
    storeId: string;
    recipientEmail: string;
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    templateType?: any;
    relatedOrderId?: string;
    relatedCartId?: string;
    scheduledFor?: Date;
  }) {
    return this.prisma.emailMessage.create({
      data: {
        storeId: data.storeId,
        recipientEmail: data.recipientEmail,
        subject: data.subject,
        bodyHtml: data.bodyHtml,
        bodyText: data.bodyText,
        templateType: data.templateType,
        relatedOrderId: data.relatedOrderId,
        relatedCartId: data.relatedCartId,
        scheduledFor: data.scheduledFor || new Date(),
        status: EmailMessageStatus.PENDING,
      },
    });
  }

  /**
   * Processes a single email message
   */
  async processEmail(messageId: string): Promise<boolean> {
    const message = await this.prisma.emailMessage.findUnique({
      where: { id: messageId },
      include: {
        store: true,
      },
    });

    if (!message) {
      this.logger.warn(`Email message ${messageId} not found`);
      return false;
    }

    if (message.status !== EmailMessageStatus.PENDING) {
      this.logger.warn(
        `Email message ${messageId} has status ${message.status}, skipping`,
      );
      return false;
    }

    // Check if max retries exceeded
    if (message.attempts >= this.maxRetries) {
      this.logger.error(
        `Email message ${messageId} exceeded max retries (${this.maxRetries})`,
      );
      await this.prisma.emailMessage.update({
        where: { id: messageId },
        data: {
          status: EmailMessageStatus.FAILED,
          errorMessage: `Max retries (${this.maxRetries}) exceeded`,
        },
      });
      return false;
    }

    try {
      // Update status to SENDING
      await this.prisma.emailMessage.update({
        where: { id: messageId },
        data: {
          status: EmailMessageStatus.SENDING,
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
        },
      });

      // Get email provider
      const provider = await this.emailProviderService.getProvider(
        message.storeId,
      );

      // Get provider config for from/reply-to info
      const providerConfig = await this.emailProviderService.getActiveProvider(
        message.storeId,
      );

      if (!providerConfig) {
        throw new Error('No active email provider configuration found');
      }

      // Send email
      const result = await provider.sendEmail({
        to: message.recipientEmail,
        from: providerConfig.fromEmail,
        fromName: providerConfig.fromName || undefined,
        replyTo: providerConfig.replyToEmail || undefined,
        subject: message.subject,
        htmlBody: message.bodyHtml,
        textBody: message.bodyText || undefined,
      });

      if (result.success) {
        // Update status to SENT
        await this.prisma.emailMessage.update({
          where: { id: messageId },
          data: {
            status: EmailMessageStatus.SENT,
            sentAt: new Date(),
            providerResponse: result.providerResponse || {},
            errorMessage: null,
          },
        });

        this.logger.log(`Email ${messageId} sent successfully`);
        return true;
      } else {
        // Update status back to PENDING for retry
        await this.prisma.emailMessage.update({
          where: { id: messageId },
          data: {
            status: EmailMessageStatus.PENDING,
            errorMessage: result.error || 'Unknown error',
            providerResponse: result.providerResponse || {},
          },
        });

        this.logger.error(`Email ${messageId} failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error processing email ${messageId}:`, error.stack);

      // Update status back to PENDING for retry
      await this.prisma.emailMessage.update({
        where: { id: messageId },
        data: {
          status: EmailMessageStatus.PENDING,
          errorMessage: error.message,
        },
      });

      return false;
    }
  }

  /**
   * Processes pending emails in the queue
   */
  async processPendingEmails(batchSize: number = 50): Promise<number> {
    const now = new Date();

    // Find pending emails ready to be sent
    const pending = await this.prisma.emailMessage.findMany({
      where: {
        status: EmailMessageStatus.PENDING,
        scheduledFor: { lte: now },
      },
      take: batchSize,
      orderBy: { scheduledFor: 'asc' },
    });

    this.logger.log(`Processing ${pending.length} pending emails`);

    let successCount = 0;

    for (const message of pending) {
      const success = await this.processEmail(message.id);
      if (success) {
        successCount++;
      }

      // Small delay between emails to avoid rate limiting
      await this.sleep(100);
    }

    this.logger.log(`Sent ${successCount}/${pending.length} emails successfully`);
    return successCount;
  }

  /**
   * Gets email history for a store
   */
  async getEmailHistory(storeId: string, options: {
    skip?: number;
    take?: number;
    status?: EmailMessageStatus;
    templateType?: any;
  } = {}) {
    const where: any = { storeId };

    if (options.status) {
      where.status = options.status;
    }

    if (options.templateType) {
      where.templateType = options.templateType;
    }

    const [emails, total] = await Promise.all([
      this.prisma.emailMessage.findMany({
        where,
        skip: options.skip || 0,
        take: options.take || 50,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.emailMessage.count({ where }),
    ]);

    return {
      data: emails,
      total,
      page: Math.floor((options.skip || 0) / (options.take || 50)) + 1,
      pageSize: options.take || 50,
      pages: Math.ceil(total / (options.take || 50)),
    };
  }

  /**
   * Retries a failed email
   */
  async retryEmail(messageId: string): Promise<boolean> {
    const message = await this.prisma.emailMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error(`Email message ${messageId} not found`);
    }

    // Reset status and attempts for retry
    await this.prisma.emailMessage.update({
      where: { id: messageId },
      data: {
        status: EmailMessageStatus.PENDING,
        attempts: 0,
        scheduledFor: new Date(),
        errorMessage: null,
      },
    });

    return this.processEmail(messageId);
  }

  /**
   * Cancels pending emails (used when cart is recovered)
   */
  async cancelPendingEmails(filter: {
    storeId: string;
    relatedCartId?: string;
    relatedOrderId?: string;
  }): Promise<number> {
    const where: any = {
      storeId: filter.storeId,
      status: EmailMessageStatus.PENDING,
    };

    if (filter.relatedCartId) {
      where.relatedCartId = filter.relatedCartId;
    }

    if (filter.relatedOrderId) {
      where.relatedOrderId = filter.relatedOrderId;
    }

    const result = await this.prisma.emailMessage.updateMany({
      where,
      data: {
        status: EmailMessageStatus.CANCELLED,
      },
    });

    this.logger.log(`Cancelled ${result.count} pending emails`);
    return result.count;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
