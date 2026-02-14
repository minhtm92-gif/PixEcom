import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type {
  IEmailProvider,
  SendEmailParams,
  SendEmailResult,
  SMTPConfig,
} from './email-provider.interface';

@Injectable()
export class SMTPProvider implements IEmailProvider {
  private readonly logger = new Logger(SMTPProvider.name);
  private transporter: Transporter;

  constructor(private readonly config: SMTPConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure, // true for 465, false for other ports
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  /**
   * Sends an email via SMTP
   */
  async sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    try {
      const info = await this.transporter.sendMail({
        from: params.fromName
          ? `"${params.fromName}" <${params.from}>`
          : params.from,
        to: params.to,
        replyTo: params.replyTo,
        subject: params.subject,
        text: params.textBody,
        html: params.htmlBody,
      });

      this.logger.log(`Email sent successfully: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        providerResponse: {
          accepted: info.accepted,
          rejected: info.rejected,
          response: info.response,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);

      return {
        success: false,
        error: error.message,
        providerResponse: error,
      };
    }
  }

  /**
   * Verifies SMTP connection and credentials
   */
  async verifyCredentials(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP credentials verified successfully');
      return true;
    } catch (error) {
      this.logger.error(
        `SMTP verification failed: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
