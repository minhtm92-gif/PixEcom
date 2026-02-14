/**
 * Parameters for sending an email
 */
export interface SendEmailParams {
  to: string;
  from: string;
  fromName?: string;
  replyTo?: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

/**
 * Result of sending an email
 */
export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  providerResponse?: any;
  error?: string;
}

/**
 * Interface for email provider implementations
 */
export interface IEmailProvider {
  /**
   * Sends an email using the provider
   * @param params Email parameters
   * @returns Result of the send operation
   */
  sendEmail(params: SendEmailParams): Promise<SendEmailResult>;

  /**
   * Verifies that the provider credentials are valid
   * @returns True if credentials are valid
   */
  verifyCredentials(): Promise<boolean>;
}

/**
 * SMTP configuration
 */
export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean; // Use TLS
  user: string;
  password: string;
}

/**
 * SendGrid configuration
 */
export interface SendGridConfig {
  apiKey: string;
}

/**
 * Mailgun configuration
 */
export interface MailgunConfig {
  apiKey: string;
  domain: string;
  region?: 'us' | 'eu'; // Default: 'us'
}
