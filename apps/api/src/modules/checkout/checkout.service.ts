import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  async initiate(
    sessionId: string,
    data: {
      customerEmail: string;
      customerName?: string;
      customerPhone?: string;
      sellpageId?: string;
      storeId?: string;
    },
  ) {
    if (!sessionId) {
      throw new BadRequestException('Cart session is required');
    }

    // Find the cart
    const cart = await this.prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    workspaceId: true,
                    basePrice: true,
                    currency: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Save customer email to cart for abandoned cart tracking
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        customerEmail: data.customerEmail,
        lastActivityAt: new Date(),
      },
    });

    // Determine workspaceId from the first product
    const workspaceId = cart.items[0].variant.product.workspaceId;

    // Calculate order totals
    const orderItems = cart.items.map((item) => {
      const unitPrice = item.variant.priceOverride
        ? Number(item.variant.priceOverride)
        : Number(item.variant.product.basePrice);

      return {
        productId: item.variant.product.id,
        variantId: item.variantId,
        productName: item.variant.product.name,
        variantName: item.variant.name,
        sku: item.variant.sku,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const currency = cart.items[0].variant.product.currency;

    // Generate order number
    const orderNumber = await this.generateOrderNumber(workspaceId);

    // Create order in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          workspaceId,
          storeId: data.storeId || cart.storeId,
          sellpageId: data.sellpageId,
          orderNumber,
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          subtotal,
          total: subtotal, // Will be updated after shipping calculation
          currency,
          status: OrderStatus.PENDING,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Reserve stock for each variant
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
      }

      return newOrder;
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      total: Number(order.total),
      currency: order.currency,
      items: order.items.map((item) => ({
        productName: item.productName,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
    };
  }

  async updateShipping(
    orderId: string,
    shippingAddress: Record<string, any>,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Shipping can only be set for pending orders');
    }

    // Calculate shipping cost (simple flat rate for now; can be extended)
    const shippingCost = 0; // Free shipping by default, or implement logic
    const total = Number(order.subtotal) + shippingCost - Number(order.discountAmount) + Number(order.taxAmount);

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        shippingAddress,
        shippingCost,
        total: Math.round(total * 100) / 100,
      },
      select: {
        id: true,
        orderNumber: true,
        shippingAddress: true,
        shippingCost: true,
        subtotal: true,
        taxAmount: true,
        discountAmount: true,
        total: true,
        status: true,
      },
    });

    return updated;
  }

  async processPayment(
    orderId: string,
    paymentData: {
      paymentMethod: string;
      paymentToken?: string;
      returnUrl?: string;
    },
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Payment can only be processed for pending orders');
    }

    // In a real implementation, this would integrate with the payment provider
    // For now, mark the order as confirmed to demonstrate the flow
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: paymentData.paymentMethod,
        status: OrderStatus.CONFIRMED,
        paidAt: new Date(),
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentMethod: true,
        total: true,
        currency: true,
        paidAt: true,
      },
    });

    return {
      ...updated,
      total: Number(updated.total),
      message: 'Payment processed successfully',
    };
  }

  async getStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        customerEmail: true,
        customerName: true,
        shippingAddress: true,
        subtotal: true,
        shippingCost: true,
        taxAmount: true,
        discountAmount: true,
        total: true,
        currency: true,
        paymentMethod: true,
        paidAt: true,
        trackingNumber: true,
        trackingUrl: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            variantName: true,
            sku: true,
            quantity: true,
            unitPrice: true,
            lineTotal: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      ...order,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      taxAmount: Number(order.taxAmount),
      discountAmount: Number(order.discountAmount),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
    };
  }

  private async generateOrderNumber(workspaceId: string): Promise<string> {
    const count = await this.prisma.order.count({ where: { workspaceId } });
    const padded = String(count + 1).padStart(6, '0');
    return `ORD-${padded}`;
  }
}
