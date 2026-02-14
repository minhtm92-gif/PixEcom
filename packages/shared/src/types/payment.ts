import { PaymentProviderType } from '../constants/payment-providers';

export interface PaymentProviderDto {
  id: string;
  workspaceId: string;
  providerType: PaymentProviderType;
  displayName: string;
  isActive: boolean;
  isDefault: boolean;
  maskedCredentials: Record<string, string>;
}

export interface PaymentResult {
  provider: PaymentProviderType;
  clientSecret?: string;
  approvalUrl?: string;
  redirectUrl?: string;
  paymentId: string;
}
