import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    workspaceId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      storeId?: string;
      search?: string;
    },
  ) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { workspaceId };

    if (options.status && Object.values(OrderStatus).includes(options.status as OrderStatus)) {
      where.status = options.status as OrderStatus;
    }

    if (options.storeId) {
      where.storeId = options.storeId;
    }

    if (options.search) {
      where.OR = [
        { orderNumber: { contains: options.search, mode: 'insensitive' } },
        { customerEmail: { contains: options.search, mode: 'insensitive' } },
        { customerName: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: { select: { id: true, name: true, slug: true } },
          items: {
            select: {
              id: true,
              productName: true,
              variantName: true,
              quantity: true,
              unitPrice: true,
              lineTotal: true,
            },
          },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((order) => ({
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
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStats(
    workspaceId: string,
    options: { storeId?: string; period?: string },
  ) {
    const where: Prisma.OrderWhereInput = { workspaceId };
    if (options.storeId) {
      where.storeId = options.storeId;
    }

    // Apply period filter
    const now = new Date();
    if (options.period) {
      let startDate: Date;
      switch (options.period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      where.createdAt = { gte: startDate };
    }

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      cancelledOrders,
      revenueAgg,
    ] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.CONFIRMED } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.CANCELLED } }),
      this.prisma.order.aggregate({
        where: {
          ...where,
          status: { in: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] },
        },
        _sum: { total: true },
        _avg: { total: true },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      cancelledOrders,
      totalRevenue: Number(revenueAgg._sum.total || 0),
      averageOrderValue: Number(revenueAgg._avg.total || 0),
    };
  }

  async findOne(workspaceId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, workspaceId },
      include: {
        store: { select: { id: true, name: true, slug: true, primaryDomain: true } },
        sellpage: { select: { id: true, slug: true, titleOverride: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                media: {
                  where: { isPrimary: true },
                  select: { url: true },
                  take: 1,
                },
              },
            },
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

  async update(
    workspaceId: string,
    orderId: string,
    data: {
      status?: OrderStatus;
      trackingNumber?: string;
      trackingUrl?: string;
      notes?: string;
    },
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, workspaceId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transitions
    if (data.status) {
      this.validateStatusTransition(order.status, data.status);
    }

    // If cancelling, restore stock
    if (data.status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      const items = await this.prisma.orderItem.findMany({
        where: { orderId },
      });

      await this.prisma.$transaction(async (tx) => {
        for (const item of items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data,
        });
      });
    } else {
      await this.prisma.order.update({
        where: { id: orderId },
        data,
      });
    }

    return this.findOne(workspaceId, orderId);
  }

  private validateStatusTransition(current: OrderStatus, next: OrderStatus) {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    const allowed = allowedTransitions[current] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Cannot transition order from '${current}' to '${next}'. Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }
  }
}
