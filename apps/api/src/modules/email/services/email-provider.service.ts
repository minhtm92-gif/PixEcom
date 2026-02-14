import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EncryptionUtil } from '../utils/encryption.util';
import { SMTPProvider } from '../providers/smtp.provider';
import type { IEmailProvider, SMTPConfig } from '../providers/email-provider.interface';
import type { EmailProviderType } from '@prisma/client';

@Injectable()
export class EmailProviderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionUtil: EncryptionUtil,
  ) {}

  /**
   * Creates a new email provider configuration
   */
  async createProvider(data: {
    storeId: string;
    providerType: EmailProviderType;
    fromEmail: string;
    fromName?: string;
    replyToEmail?: string;
    credentials: Record<string, any>;
  }) {
    // Encrypt credentials
    const credentialsEnc = this.encryptionUtil.encryptObject(data.credentials);

    // Deactivate other providers of the same type
    await this.prisma.emailProviderConfig.updateMany({
      where: {
        storeId: data.storeId,
        providerType: data.providerType,
      },
      data: {
        isActive: false,
      },
    });

    return this.prisma.emailProviderConfig.create({
      data: {
        storeId: data.storeId,
        providerType: data.providerType,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        replyToEmail: data.replyToEmail,
        credentialsEnc,
        isActive: true,
      },
    });
  }

  /**
   * Gets all email providers for a store
   */
  async getProviders(storeId: string) {
    return this.prisma.emailProviderConfig.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Gets active email provider for a store
   */
  async getActiveProvider(storeId: string) {
    return this.prisma.emailProviderConfig.findFirst({
      where: {
        storeId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Updates an email provider configuration
   */
  async updateProvider(
    id: string,
    data: {
      fromEmail?: string;
      fromName?: string;
      replyToEmail?: string;
      credentials?: Record<string, any>;
      isActive?: boolean;
    },
  ) {
    const updateData: any = {
      fromEmail: data.fromEmail,
      fromName: data.fromName,
      replyToEmail: data.replyToEmail,
      isActive: data.isActive,
    };

    // Encrypt new credentials if provided
    if (data.credentials) {
      updateData.credentialsEnc = this.encryptionUtil.encryptObject(
        data.credentials,
      );
    }

    return this.prisma.emailProviderConfig.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Deletes an email provider configuration
   */
  async deleteProvider(id: string) {
    return this.prisma.emailProviderConfig.delete({
      where: { id },
    });
  }

  /**
   * Gets an email provider instance for sending emails
   */
  async getProvider(storeId: string): Promise<IEmailProvider> {
    const config = await this.getActiveProvider(storeId);

    if (!config) {
      throw new NotFoundException(
        `No active email provider found for store ${storeId}`,
      );
    }

    // Decrypt credentials
    const credentials = this.encryptionUtil.decryptObject(
      config.credentialsEnc,
    );

    // Create provider instance based on type
    switch (config.providerType) {
      case 'SMTP':
        return new SMTPProvider(credentials as SMTPConfig);

      case 'SENDGRID':
        // TODO: Implement SendGrid provider
        throw new Error('SendGrid provider not yet implemented');

      case 'MAILGUN':
        // TODO: Implement Mailgun provider
        throw new Error('Mailgun provider not yet implemented');

      default:
        throw new Error(`Unknown provider type: ${config.providerType}`);
    }
  }

  /**
   * Tests an email provider configuration
   */
  async testProvider(id: string, testEmail: string): Promise<boolean> {
    const config = await this.prisma.emailProviderConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`Email provider ${id} not found`);
    }

    try {
      // Decrypt credentials
      const credentials = this.encryptionUtil.decryptObject(
        config.credentialsEnc,
      );

      // Create provider instance
      let provider: IEmailProvider;

      switch (config.providerType) {
        case 'SMTP':
          provider = new SMTPProvider(credentials as SMTPConfig);
          break;

        default:
          throw new Error(`Unknown provider type: ${config.providerType}`);
      }

      // First verify credentials
      const credentialsValid = await provider.verifyCredentials();
      if (!credentialsValid) {
        return false;
      }

      // Send test email
      const result = await provider.sendEmail({
        to: testEmail,
        from: config.fromEmail,
        fromName: config.fromName || undefined,
        replyTo: config.replyToEmail || undefined,
        subject: 'PixEcom Email Provider Test',
        htmlBody: `
          <h2>Email Provider Test</h2>
          <p>This is a test email from PixEcom.</p>
          <p>Your email provider is configured correctly!</p>
          <p><strong>Provider Type:</strong> ${config.providerType}</p>
          <p><strong>From Email:</strong> ${config.fromEmail}</p>
        `,
        textBody:
          'This is a test email from PixEcom. Your email provider is configured correctly!',
      });

      return result.success;
    } catch (error) {
      throw new Error(`Email provider test failed: ${error.message}`);
    }
  }
}
