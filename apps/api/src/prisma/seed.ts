import { PrismaClient, MemberRole, ProductStatus, SellpageStatus, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PixEcom v2.0...');

  // ─── Admin User ──────────────────────────────────
  const adminEmail = 'admin@pixecom.io';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash('Admin123!', 12),
        displayName: 'Admin',
        isActive: true,
        isSuperadmin: true,
      },
    });
    console.log('  Created admin user:', adminEmail);
  }

  // ─── Workspace ───────────────────────────────────
  let workspace = await prisma.workspace.findUnique({ where: { slug: 'pixel-team' } });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { name: 'Pixel Team', slug: 'pixel-team', isActive: true },
    });
    console.log('  Created workspace: Pixel Team');
  }

  // ─── Membership ──────────────────────────────────
  const existingMembership = await prisma.membership.findUnique({
    where: { uq_membership_ws_user: { workspaceId: workspace.id, userId: admin.id } },
  });
  if (!existingMembership) {
    await prisma.membership.create({
      data: {
        workspaceId: workspace.id,
        userId: admin.id,
        role: MemberRole.OWNER,
        isActive: true,
      },
    });
    console.log('  Created OWNER membership: admin -> Pixel Team');
  }

  // ─── General Settings ────────────────────────────
  const existingSettings = await prisma.generalSettings.findUnique({
    where: { workspaceId: workspace.id },
  });
  if (!existingSettings) {
    await prisma.generalSettings.create({
      data: {
        workspaceId: workspace.id,
        brandName: 'Pixel Team',
        defaultCurrency: 'USD',
        timezone: 'UTC',
        supportEmail: 'support@pixecom.local',
        supportPhone: '+1-555-0100',
      },
    });
    console.log('  Created general settings');
  }

  // ─── Store ───────────────────────────────────────
  let store = await prisma.store.findFirst({
    where: { workspaceId: workspace.id, slug: 'lilly-goodies' },
  });
  if (!store) {
    store = await prisma.store.create({
      data: {
        workspaceId: workspace.id,
        name: 'Lilly Goodies',
        slug: 'lilly-goodies',
        primaryDomain: 'lillygoodies.com',
        logoUrl: 'https://placehold.co/200x60/6C5CE7/white?text=LillyGoodies',
        faviconUrl: 'https://placehold.co/32x32/6C5CE7/white?text=LG',
        brandColor: '#6C5CE7',
        currency: 'USD',
        homepageTitle: 'Lilly Goodies - Quality Products',
        homepageDescription: 'Discover our curated collection of premium everyday products.',
        homepageConfig: [
          {
            id: 'hp-hero-1',
            type: 'hero',
            position: 0,
            visible: true,
            config: {
              headline: 'Welcome to Lilly Goodies',
              subheadline: 'Premium products for everyday life',
              backgroundImage: 'https://placehold.co/1920x600/6C5CE7/white?text=Hero',
              ctaText: 'Shop Now',
              ctaUrl: '#products',
            },
          },
          {
            id: 'hp-featured-1',
            type: 'featured-product',
            position: 1,
            visible: true,
            config: { title: 'Featured Products', maxProducts: 4 },
          },
          {
            id: 'hp-reviews-1',
            type: 'reviews',
            position: 2,
            visible: true,
            config: {
              title: 'What Our Customers Say',
              reviews: [
                { name: 'Sarah M.', rating: 5, text: 'Amazing quality! Will buy again.', verified: true },
                { name: 'Mike R.', rating: 5, text: 'Fast shipping, great product.', verified: true },
                { name: 'Emily T.', rating: 4, text: 'Love the design, very comfortable.', verified: true },
              ],
            },
          },
          {
            id: 'hp-guarantee-1',
            type: 'guarantee',
            position: 3,
            visible: true,
            config: {
              title: 'Our Guarantee',
              items: [
                { icon: 'shield', title: '30-Day Money Back', description: 'No questions asked' },
                { icon: 'truck', title: 'Free Shipping', description: 'On orders over $50' },
                { icon: 'headphones', title: '24/7 Support', description: 'We are here to help' },
              ],
            },
          },
        ],
        themeConfig: { primaryColor: '#6C5CE7', font: 'Inter' },
        isActive: true,
      },
    });
    console.log('  Created store: Lilly Goodies (lillygoodies.com)');
  }

  // ─── Product 1: FlexFit Compression Shirt ────────
  let product1 = await prisma.product.findFirst({
    where: { workspaceId: workspace.id, slug: 'flexfit-compression-shirt' },
  });
  if (!product1) {
    product1 = await prisma.product.create({
      data: {
        workspaceId: workspace.id,
        name: 'FlexFit Compression Shirt',
        slug: 'flexfit-compression-shirt',
        basePrice: 39.99,
        compareAtPrice: 59.99,
        costPrice: 12.50,
        currency: 'USD',
        sku: 'FF-COMP-001',
        description:
          '<p>The FlexFit Compression Shirt is engineered for peak performance. Made with moisture-wicking fabric.</p>',
        descriptionBlocks: [
          { type: 'text', content: 'Engineered for peak performance.' },
          { type: 'feature_list', items: ['4-way stretch', 'Flatlock seams', 'UPF 50+', 'Quick-dry'] },
        ],
        shippingInfo: { weight_g: 180, ships_from: 'US', delivery_days: '5-10' },
        tags: ['fitness', 'compression', 'athletic'],
        status: ProductStatus.ACTIVE,
        createdBy: admin.id,
        variants: {
          create: [
            {
              name: 'S / Black',
              sku: 'FF-S-BLK',
              options: { Size: 'S', Color: 'Black' },
              stockQuantity: 50,
              position: 0,
            },
            {
              name: 'M / Black',
              sku: 'FF-M-BLK',
              options: { Size: 'M', Color: 'Black' },
              stockQuantity: 75,
              position: 1,
            },
            {
              name: 'L / Black',
              sku: 'FF-L-BLK',
              options: { Size: 'L', Color: 'Black' },
              stockQuantity: 60,
              position: 2,
            },
            {
              name: 'XL / Navy',
              sku: 'FF-XL-NVY',
              priceOverride: 42.99,
              options: { Size: 'XL', Color: 'Navy' },
              stockQuantity: 30,
              position: 3,
            },
          ],
        },
        media: {
          create: [
            {
              url: 'https://placehold.co/800x800/2D3436/white?text=FlexFit+Front',
              altText: 'FlexFit front view',
              displayOrder: 0,
              isPrimary: true,
            },
            {
              url: 'https://placehold.co/800x800/636E72/white?text=FlexFit+Back',
              altText: 'FlexFit back view',
              displayOrder: 1,
            },
          ],
        },
      },
    });
    console.log('  Created product: FlexFit Compression Shirt (4 variants, 2 images)');
  }

  // ─── Product 2: AquaPure Water Bottle ────────────
  let product2 = await prisma.product.findFirst({
    where: { workspaceId: workspace.id, slug: 'aquapure-water-bottle' },
  });
  if (!product2) {
    product2 = await prisma.product.create({
      data: {
        workspaceId: workspace.id,
        name: 'AquaPure Water Bottle',
        slug: 'aquapure-water-bottle',
        basePrice: 24.99,
        compareAtPrice: 34.99,
        costPrice: 6.0,
        currency: 'USD',
        sku: 'AP-BOTTLE-001',
        description:
          '<p>Stay hydrated with the AquaPure Water Bottle. Double-wall vacuum insulation.</p>',
        descriptionBlocks: [
          { type: 'text', content: 'Stay hydrated in style.' },
          { type: 'feature_list', items: ['BPA-free', 'Leak-proof', 'Fits cup holders', 'Easy-clean'] },
        ],
        shippingInfo: { weight_g: 350, ships_from: 'US', delivery_days: '5-10' },
        tags: ['hydration', 'fitness', 'eco-friendly'],
        status: ProductStatus.ACTIVE,
        createdBy: admin.id,
        variants: {
          create: [
            {
              name: '500ml / Matte Black',
              sku: 'AP-500-BLK',
              options: { Size: '500ml', Color: 'Matte Black' },
              stockQuantity: 100,
              position: 0,
            },
            {
              name: '1L / Matte Black',
              sku: 'AP-1L-BLK',
              priceOverride: 29.99,
              options: { Size: '1L', Color: 'Matte Black' },
              stockQuantity: 80,
              position: 1,
            },
            {
              name: '500ml / Arctic White',
              sku: 'AP-500-WHT',
              options: { Size: '500ml', Color: 'Arctic White' },
              stockQuantity: 60,
              position: 2,
            },
          ],
        },
        media: {
          create: [
            {
              url: 'https://placehold.co/800x800/0984E3/white?text=AquaPure+Front',
              altText: 'AquaPure front view',
              displayOrder: 0,
              isPrimary: true,
            },
            {
              url: 'https://placehold.co/800x800/74B9FF/white?text=AquaPure+Lifestyle',
              altText: 'AquaPure lifestyle',
              displayOrder: 1,
            },
          ],
        },
      },
    });
    console.log('  Created product: AquaPure Water Bottle (3 variants, 2 images)');
  }

  // ─── Sellpage 1: FlexFit ─────────────────────────
  const existingSp1 = await prisma.sellpage.findFirst({
    where: { storeId: store.id, slug: 'flexfit-compression-shirt' },
  });
  if (!existingSp1) {
    await prisma.sellpage.create({
      data: {
        workspaceId: workspace.id,
        storeId: store.id,
        productId: product1.id,
        slug: 'flexfit-compression-shirt',
        subdomain: 'flexfit',
        status: SellpageStatus.PUBLISHED,
        titleOverride: 'FlexFit Compression Shirt - Performance Wear',
        seoTitle: 'FlexFit Compression Shirt - Performance Wear',
        seoDescription: 'Engineered for peak athletic performance. Free shipping.',
        sections: [
          {
            id: 'sp1-announce',
            type: 'announcement-bar',
            position: 0,
            visible: true,
            config: {
              text: 'FREE SHIPPING ON ALL ORDERS! 🚚',
              backgroundColor: '#FF6B6B',
              textColor: '#FFFFFF',
            },
          },
          {
            id: 'sp1-hero',
            type: 'hero',
            position: 1,
            visible: true,
            config: {
              headline: 'FlexFit Compression Shirt',
              subheadline: 'Engineered for peak performance. 4-way stretch, moisture-wicking, UV protection.',
              badgeText: 'Best Seller',
              showPrice: true,
              showComparePrice: true,
            },
          },
          {
            id: 'sp1-features',
            type: 'features',
            position: 2,
            visible: true,
            config: {
              title: 'Why Choose FlexFit?',
              features: [
                { icon: 'zap', title: '4-Way Stretch', description: 'Moves with your body' },
                { icon: 'droplet', title: 'Moisture-Wicking', description: 'Stay cool and dry' },
                { icon: 'sun', title: 'UPF 50+', description: 'UV protection built-in' },
                { icon: 'shield', title: 'Flatlock Seams', description: 'Zero chafing design' },
              ],
            },
          },
          {
            id: 'sp1-social',
            type: 'social-proof',
            position: 3,
            visible: true,
            config: {
              title: 'What Athletes Say',
              averageRating: 4.9,
              reviewCount: 2346,
              reviews: [
                { name: 'Sarah M.', rating: 5, text: 'Best compression shirt I have ever owned!', verified: true },
                { name: 'Jake R.', rating: 5, text: 'Amazing quality, fits perfectly.', verified: true },
                { name: 'Anna K.', rating: 4, text: 'Great for workouts, love the fabric.', verified: true },
              ],
            },
          },
          {
            id: 'sp1-faq',
            type: 'faq',
            position: 4,
            visible: true,
            config: {
              title: 'Frequently Asked Questions',
              items: [
                { question: 'What sizes are available?', answer: 'We offer S, M, L, and XL.' },
                { question: 'How do I wash it?', answer: 'Machine wash cold, tumble dry low.' },
                { question: 'Is there a warranty?', answer: 'Yes, 30-day money-back guarantee.' },
              ],
            },
          },
          {
            id: 'sp1-cta',
            type: 'sticky-cta',
            position: 5,
            visible: true,
            config: {
              text: 'Add to Cart',
              backgroundColor: '#2563EB',
              textColor: '#FFFFFF',
            },
          },
        ],
        headerConfig: {},
        footerConfig: {
          col1Title: 'Order Resources',
          col2Title: 'How can we help you?',
          col3Title: 'Policies',
        },
        boostModules: [
          { type: 'trust_badge', text: '30-Day Money Back Guarantee' },
          { type: 'urgency', text: 'Only 15 left in stock!' },
        ],
        discountRules: [
          { minQty: 2, extraPercent: 5 },
          { minQty: 3, extraPercent: 5 },
        ],
        createdBy: admin.id,
      },
    });
    console.log('  Created sellpage: flexfit-compression-shirt');
  }

  // ─── Sellpage 2: AquaPure ────────────────────────
  const existingSp2 = await prisma.sellpage.findFirst({
    where: { storeId: store.id, slug: 'aquapure-water-bottle' },
  });
  if (!existingSp2) {
    await prisma.sellpage.create({
      data: {
        workspaceId: workspace.id,
        storeId: store.id,
        productId: product2.id,
        slug: 'aquapure-water-bottle',
        subdomain: 'aquapure',
        status: SellpageStatus.PUBLISHED,
        titleOverride: 'AquaPure Water Bottle - Stay Hydrated',
        seoTitle: 'AquaPure Water Bottle - Stay Hydrated',
        seoDescription: 'Premium insulated water bottle. Keeps cold 24hrs.',
        sections: [
          {
            id: 'sp2-announce',
            type: 'announcement-bar',
            position: 0,
            visible: true,
            config: {
              text: 'BUY 2, GET 10% OFF!',
              backgroundColor: '#0984E3',
              textColor: '#FFFFFF',
            },
          },
          {
            id: 'sp2-hero',
            type: 'hero',
            position: 1,
            visible: true,
            config: {
              headline: 'AquaPure Water Bottle',
              subheadline: 'Double-wall vacuum insulation. Cold 24hrs. Hot 12hrs.',
              showPrice: true,
              showComparePrice: true,
            },
          },
          {
            id: 'sp2-problem',
            type: 'problem',
            position: 2,
            visible: true,
            config: {
              title: 'Tired of Warm Water?',
              description: 'Regular bottles lose temperature in hours. Your water deserves better.',
              imageUrl: 'https://placehold.co/600x400/DFE6E9/2D3436?text=Problem',
            },
          },
          {
            id: 'sp2-solution',
            type: 'solution',
            position: 3,
            visible: true,
            config: {
              title: 'Meet AquaPure',
              description: 'Double-wall vacuum insulation keeps your drinks at the perfect temperature all day.',
              imageUrl: 'https://placehold.co/600x400/0984E3/white?text=Solution',
            },
          },
          {
            id: 'sp2-social',
            type: 'social-proof',
            position: 4,
            visible: true,
            config: {
              title: 'Loved by Thousands',
              averageRating: 4.8,
              reviewCount: 1892,
              reviews: [
                { name: 'Emily T.', rating: 5, text: 'Keeps my water cold all day at work!', verified: true },
                { name: 'Chris W.', rating: 5, text: 'Beautiful design and amazing insulation.', verified: true },
              ],
            },
          },
          {
            id: 'sp2-cta',
            type: 'sticky-cta',
            position: 5,
            visible: true,
            config: {
              text: 'Buy Now',
              backgroundColor: '#0984E3',
              textColor: '#FFFFFF',
            },
          },
        ],
        headerConfig: {},
        footerConfig: {},
        boostModules: [{ type: 'trust_badge', text: 'Free Shipping on All Orders' }],
        discountRules: [{ minQty: 2, extraPercent: 10 }],
        createdBy: admin.id,
      },
    });
    console.log('  Created sellpage: aquapure-water-bottle');
  }

  // ─── Legal Policies ──────────────────────────────
  const policiesData = [
    {
      title: 'Refund Policy',
      slug: 'refund-policy',
      policyType: 'refund',
      bodyHtml:
        '<h2>Refund Policy</h2><p>We offer a 30-day money-back guarantee on all products.</p>',
    },
    {
      title: 'Shipping Policy',
      slug: 'shipping-policy',
      policyType: 'shipping',
      bodyHtml:
        '<h2>Shipping Policy</h2><p>We ship to all 50 US states. Domestic: 5-10 business days.</p>',
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      policyType: 'privacy',
      bodyHtml:
        '<h2>Privacy Policy</h2><p>We respect your privacy and protect your personal data.</p>',
    },
  ];

  for (const pd of policiesData) {
    const existing = await prisma.legalPolicy.findFirst({
      where: { workspaceId: workspace.id, slug: pd.slug },
    });
    if (!existing) {
      const policy = await prisma.legalPolicy.create({
        data: { workspaceId: workspace.id, ...pd },
      });
      // Attach to store
      await prisma.storePolicy.create({
        data: { storeId: store.id, policyId: policy.id, displayOrder: policiesData.indexOf(pd) },
      });
      console.log(`  Created legal policy: ${pd.title}`);
    }
  }

  // ─── Payment Provider (Stripe Test) ──────────────
  const existingProvider = await prisma.paymentProvider.findFirst({
    where: { workspaceId: workspace.id, providerType: 'stripe' },
  });
  if (!existingProvider) {
    await prisma.paymentProvider.create({
      data: {
        workspaceId: workspace.id,
        providerType: 'stripe',
        displayName: 'Stripe (Test)',
        credentialsEnc: 'PLACEHOLDER_NOT_ENCRYPTED',
        isActive: true,
        isDefault: true,
      },
    });
    console.log('  Created payment provider: Stripe (Test)');
  }

  // ─── Demo Orders ─────────────────────────────────
  const existingOrder = await prisma.order.findFirst({
    where: { workspaceId: workspace.id, orderNumber: 'ORD-1001' },
  });
  if (!existingOrder) {
    const p1Variants = await prisma.productVariant.findMany({
      where: { productId: product1.id },
      orderBy: { position: 'asc' },
    });
    const p2Variants = await prisma.productVariant.findMany({
      where: { productId: product2.id },
      orderBy: { position: 'asc' },
    });

    await prisma.order.create({
      data: {
        workspaceId: workspace.id,
        storeId: store.id,
        orderNumber: 'ORD-1001',
        customerEmail: 'alice@example.com',
        customerName: 'Alice Johnson',
        customerPhone: '+1-555-0301',
        shippingAddress: {
          firstName: 'Alice',
          lastName: 'Johnson',
          address1: '123 Main St',
          city: 'Austin',
          state: 'TX',
          postalCode: '73301',
          country: 'US',
        },
        subtotal: 39.99,
        shippingCost: 4.99,
        total: 44.98,
        currency: 'USD',
        status: OrderStatus.CONFIRMED,
        trackingNumber: '1Z999AA10123456784',
        paymentMethod: 'stripe',
        paidAt: new Date(),
        items: {
          create: [
            {
              productId: product1.id,
              variantId: p1Variants[0]?.id || null,
              productName: 'FlexFit Compression Shirt',
              variantName: p1Variants[0]?.name || null,
              sku: p1Variants[0]?.sku || 'FF-COMP-001',
              quantity: 1,
              unitPrice: 39.99,
              lineTotal: 39.99,
            },
          ],
        },
      },
    });
    console.log('  Created order: ORD-1001 (confirmed)');

    await prisma.order.create({
      data: {
        workspaceId: workspace.id,
        storeId: store.id,
        orderNumber: 'ORD-1002',
        customerEmail: 'bob@example.com',
        customerName: 'Bob Smith',
        shippingAddress: {
          firstName: 'Bob',
          lastName: 'Smith',
          address1: '456 Oak Ave',
          city: 'Portland',
          state: 'OR',
          postalCode: '97201',
          country: 'US',
        },
        subtotal: 54.98,
        shippingCost: 0,
        total: 54.98,
        currency: 'USD',
        status: OrderStatus.PENDING,
        notes: 'Free shipping order',
        items: {
          create: [
            {
              productId: product2.id,
              variantId: p2Variants[0]?.id || null,
              productName: 'AquaPure Water Bottle',
              variantName: p2Variants[0]?.name || null,
              sku: p2Variants[0]?.sku || 'AP-BOTTLE-001',
              quantity: 2,
              unitPrice: 24.99,
              lineTotal: 49.98,
            },
            {
              productId: product1.id,
              productName: 'FlexFit Compression Shirt',
              sku: 'FF-COMP-001',
              quantity: 1,
              unitPrice: 5.0,
              lineTotal: 5.0,
            },
          ],
        },
      },
    });
    console.log('  Created order: ORD-1002 (pending)');
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
