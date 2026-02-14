import { OrderStatus } from '../constants/order-status';

export interface OrderDto {
  id: string;
  workspaceId: string;
  storeId: string | null;
  sellpageId: string | null;
  orderNumber: string;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  trackingNumber: string | null;
  trackingUrl: string | null;
  paymentMethod: string | null;
  paymentId: string | null;
  paidAt: string | null;
  items: OrderItemDto[];
  createdAt: string;
}

export interface OrderItemDto {
  id: string;
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}
