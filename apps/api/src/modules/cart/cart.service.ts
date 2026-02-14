import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(sessionId: string) {
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
                    slug: true,
                    basePrice: true,
                    currency: true,
                    media: {
                      where: { isPrimary: true },
                      select: { url: true, altText: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      return { items: [], itemCount: 0, subtotal: 0 };
    }

    const items = cart.items.map((item) => {
      const price = item.variant.priceOverride
        ? Number(item.variant.priceOverride)
        : Number(item.variant.product.basePrice);

      return {
        id: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: price,
        lineTotal: price * item.quantity,
        variant: {
          id: item.variant.id,
          name: item.variant.name,
          sku: item.variant.sku,
          options: item.variant.options,
          stockQuantity: item.variant.stockQuantity,
        },
        product: {
          id: item.variant.product.id,
          name: item.variant.product.name,
          slug: item.variant.product.slug,
          currency: item.variant.product.currency,
          primaryImage: item.variant.product.media[0] || null,
        },
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      items,
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
    };
  }

  async addItem(sessionId: string, variantId: string, quantity: number, storeId?: string) {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    // Verify variant exists and is active
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { select: { status: true } } },
    });

    if (!variant || !variant.isActive) {
      throw new NotFoundException('Product variant not found or is not available');
    }

    if (variant.product.status !== 'ACTIVE') {
      throw new BadRequestException('Product is not currently available');
    }

    if (variant.stockQuantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Only ${variant.stockQuantity} available.`,
      );
    }

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({ where: { sessionId } });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          sessionId,
          storeId: storeId || null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        uq_cart_item: { cartId: cart.id, variantId },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (variant.stockQuantity < newQuantity) {
        throw new BadRequestException(
          `Insufficient stock. Only ${variant.stockQuantity} available (${existingItem.quantity} already in cart).`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
      });
    }

    // Update cart activity timestamp for abandoned cart tracking
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { lastActivityAt: new Date() },
    });

    return this.getCart(sessionId);
  }

  async updateItem(sessionId: string, itemId: string, quantity: number) {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const cart = await this.prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { variant: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.variant.stockQuantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Only ${cartItem.variant.stockQuantity} available.`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    // Update cart activity timestamp for abandoned cart tracking
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { lastActivityAt: new Date() },
    });

    return this.getCart(sessionId);
  }

  async removeItem(sessionId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    // Update cart activity timestamp for abandoned cart tracking
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { lastActivityAt: new Date() },
    });
  }

  async clearCart(sessionId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) return;

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}
