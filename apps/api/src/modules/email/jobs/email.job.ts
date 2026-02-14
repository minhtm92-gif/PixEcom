import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailQueueService } from '../services/email-queue.service';
import { AbandonedCartService } from '../services/abandoned-cart.service';

@Injectable()
export class EmailJob {
  private readonly logger = new Logger(EmailJob.name);

  constructor(
    private readonly emailQueueService: EmailQueueService,
    private readonly abandonedCartService: AbandonedCartService,
  ) {}

  /**
   * Process email queue - Every 1 minute
   * Sends pending emails that are scheduled to be sent
   */
  @Cron('*/1 * * * *', {
    name: 'process-email-queue',
  })
  async processEmailQueue() {
    this.logger.log('[Email Queue] Starting queue processing...');

    try {
      const sentCount = await this.emailQueueService.processPendingEmails(50);

      if (sentCount > 0) {
        this.logger.log(`[Email Queue] Sent ${sentCount} emails`);
      }
    } catch (error) {
      this.logger.error(
        `[Email Queue] Processing failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Detect abandoned carts - Every 10 minutes
   * Identifies carts that have been inactive for 1+ hours
   */
  @Cron('*/10 * * * *', {
    name: 'detect-abandoned-carts',
  })
  async detectAbandonedCarts() {
    this.logger.log('[Abandoned Carts] Starting detection...');

    try {
      const trackedCount = await this.abandonedCartService.detectAbandonedCarts(100);

      if (trackedCount > 0) {
        this.logger.log(
          `[Abandoned Carts] Tracked ${trackedCount} new abandoned carts`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[Abandoned Carts] Detection failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Schedule abandoned cart emails - Every 5 minutes
   * Creates email messages for abandoned carts based on automation rules
   */
  @Cron('*/5 * * * *', {
    name: 'schedule-abandoned-cart-emails',
  })
  async scheduleAbandonedCartEmails() {
    this.logger.log('[Abandoned Cart Emails] Starting scheduling...');

    try {
      const { PrismaService } = await import('../../../prisma/prisma.service');
      const prisma = new PrismaService();

      // Find all unrecovered cart abandonments
      const abandonments = await prisma.cartAbandonment.findMany({
        where: {
          isRecovered: false,
        },
        include: {
          cart: {
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
          },
        },
        take: 100,
      });

      let scheduledCount = 0;

      for (const abandonment of abandonments) {
        try {
          await this.abandonedCartService.scheduleEmails(abandonment);
          scheduledCount++;
        } catch (error) {
          this.logger.error(
            `[Abandoned Cart Emails] Failed to schedule for cart ${abandonment.cartId}: ${error.message}`,
          );
        }
      }

      if (scheduledCount > 0) {
        this.logger.log(
          `[Abandoned Cart Emails] Scheduled emails for ${scheduledCount} abandonments`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[Abandoned Cart Emails] Scheduling failed: ${error.message}`,
        error.stack,
      );
    }
  }
}
