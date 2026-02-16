export interface SellpageTemplate {
  id: string;
  name: string;
  description: string;
  category: 'ecommerce' | 'digital' | 'service' | 'minimal';
  thumbnail: string;
  previewUrl?: string;
  sections: any[];
  headerConfig: any;
  footerConfig: any;
  isPopular?: boolean;
  isPremium?: boolean;
}

export const SELLPAGE_TEMPLATES: SellpageTemplate[] = [
  {
    id: 'ecom-pro',
    name: 'E-Commerce Pro',
    description: 'Perfect for physical products with full feature set',
    category: 'ecommerce',
    thumbnail: 'https://placehold.co/400x300/6C5CE7/white?text=E-Commerce+Pro',
    isPopular: true,
    sections: [
      {
        id: 'announce',
        type: 'announcement-bar',
        position: 0,
        visible: true,
        config: {
          text: 'FREE SHIPPING ON ALL ORDERS! 🚚',
          backgroundColor: '#6C5CE7',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'hero',
        type: 'hero',
        position: 1,
        visible: true,
        config: {
          headline: 'Your Product Name',
          subheadline: 'Transform your life with our premium product',
          badgeText: 'Best Seller',
          showPrice: true,
          showComparePrice: true,
        },
      },
      {
        id: 'features',
        type: 'features',
        position: 2,
        visible: true,
        config: {
          title: 'Why Choose This Product?',
          features: [
            { icon: 'zap', title: 'Fast Results', description: 'See results in just 7 days' },
            { icon: 'shield', title: 'Quality Guaranteed', description: 'Premium materials' },
            { icon: 'heart', title: 'Customer Loved', description: '10,000+ happy customers' },
            { icon: 'award', title: 'Award Winning', description: 'Industry recognized' },
          ],
        },
      },
      {
        id: 'social-proof',
        type: 'social-proof',
        position: 3,
        visible: true,
        config: {
          title: 'What Our Customers Say',
          averageRating: 4.9,
          reviewCount: 2500,
          reviews: [
            { name: 'Sarah M.', rating: 5, text: 'Absolutely love this product!', verified: true },
            { name: 'John D.', rating: 5, text: 'Best purchase I made this year.', verified: true },
            { name: 'Emily R.', rating: 5, text: 'Exceeded my expectations!', verified: true },
          ],
        },
      },
      {
        id: 'faq',
        type: 'faq',
        position: 4,
        visible: true,
        config: {
          title: 'Frequently Asked Questions',
          items: [
            { question: 'How long does shipping take?', answer: 'We ship within 24 hours. Delivery takes 5-7 business days.' },
            { question: 'What is your return policy?', answer: '30-day money-back guarantee, no questions asked.' },
            { question: 'Is it safe to order?', answer: 'Yes! We use secure SSL encryption for all transactions.' },
          ],
        },
      },
      {
        id: 'cta',
        type: 'sticky-cta',
        position: 5,
        visible: true,
        config: {
          text: 'Add to Cart',
          backgroundColor: '#6C5CE7',
          textColor: '#FFFFFF',
        },
      },
    ],
    headerConfig: {},
    footerConfig: {
      col1Title: 'Quick Links',
      col2Title: 'Support',
      col3Title: 'Legal',
    },
  },
  {
    id: 'digital-download',
    name: 'Digital Download',
    description: 'Optimized for digital products and downloads',
    category: 'digital',
    thumbnail: 'https://placehold.co/400x300/0984E3/white?text=Digital+Download',
    isPopular: true,
    sections: [
      {
        id: 'hero',
        type: 'hero',
        position: 0,
        visible: true,
        config: {
          headline: 'Instant Access',
          subheadline: 'Download immediately after purchase',
          showPrice: true,
          showComparePrice: true,
        },
      },
      {
        id: 'features',
        type: 'features',
        position: 1,
        visible: true,
        config: {
          title: "What's Included",
          features: [
            { icon: 'download', title: 'Instant Download', description: 'Get it right away' },
            { icon: 'file', title: 'All Formats', description: 'PDF, EPUB, MOBI included' },
            { icon: 'infinity', title: 'Lifetime Access', description: 'Download anytime' },
            { icon: 'refresh', title: 'Free Updates', description: 'Get new versions free' },
          ],
        },
      },
      {
        id: 'social-proof',
        type: 'social-proof',
        position: 2,
        visible: true,
        config: {
          title: 'Trusted by Thousands',
          averageRating: 4.8,
          reviewCount: 1200,
          reviews: [
            { name: 'Alex T.', rating: 5, text: 'Great value for money!', verified: true },
            { name: 'Lisa K.', rating: 5, text: 'Instant download worked perfectly.', verified: true },
          ],
        },
      },
      {
        id: 'cta',
        type: 'sticky-cta',
        position: 3,
        visible: true,
        config: {
          text: 'Buy Now - Instant Access',
          backgroundColor: '#0984E3',
          textColor: '#FFFFFF',
        },
      },
    ],
    headerConfig: {},
    footerConfig: {},
  },
  {
    id: 'service-booking',
    name: 'Service Booking',
    description: 'Perfect for services and consultations',
    category: 'service',
    thumbnail: 'https://placehold.co/400x300/00B894/white?text=Service+Booking',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        position: 0,
        visible: true,
        config: {
          headline: 'Book Your Session',
          subheadline: 'Expert consultation at your convenience',
          showPrice: true,
        },
      },
      {
        id: 'problem',
        type: 'problem',
        position: 1,
        visible: true,
        config: {
          title: 'Struggling with...?',
          description: 'You are not alone. Many face the same challenges.',
          imageUrl: 'https://placehold.co/600x400/DFE6E9/2D3436?text=Problem',
        },
      },
      {
        id: 'solution',
        type: 'solution',
        position: 2,
        visible: true,
        config: {
          title: 'Here is the Solution',
          description: 'Our proven method helps you achieve your goals.',
          imageUrl: 'https://placehold.co/600x400/00B894/white?text=Solution',
        },
      },
      {
        id: 'features',
        type: 'features',
        position: 3,
        visible: true,
        config: {
          title: 'What You Get',
          features: [
            { icon: 'calendar', title: 'Flexible Scheduling', description: 'Book at your convenience' },
            { icon: 'video', title: 'Video Call', description: 'Meet online or in-person' },
            { icon: 'clock', title: '60 Minutes', description: 'Full hour session' },
            { icon: 'message', title: 'Follow-up Support', description: '14 days of email support' },
          ],
        },
      },
      {
        id: 'cta',
        type: 'sticky-cta',
        position: 4,
        visible: true,
        config: {
          text: 'Book Now',
          backgroundColor: '#00B894',
          textColor: '#FFFFFF',
        },
      },
    ],
    headerConfig: {},
    footerConfig: {},
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Simple and elegant design with essential sections',
    category: 'minimal',
    thumbnail: 'https://placehold.co/400x300/2D3436/white?text=Minimal+Clean',
    isPremium: true,
    sections: [
      {
        id: 'hero',
        type: 'hero',
        position: 0,
        visible: true,
        config: {
          headline: 'Less is More',
          subheadline: 'Pure quality, no distractions',
          showPrice: true,
          showComparePrice: false,
        },
      },
      {
        id: 'features',
        type: 'features',
        position: 1,
        visible: true,
        config: {
          title: 'Key Features',
          features: [
            { icon: 'star', title: 'Premium Quality', description: 'Handcrafted with care' },
            { icon: 'truck', title: 'Fast Delivery', description: 'Ships next day' },
          ],
        },
      },
      {
        id: 'cta',
        type: 'sticky-cta',
        position: 2,
        visible: true,
        config: {
          text: 'Purchase',
          backgroundColor: '#2D3436',
          textColor: '#FFFFFF',
        },
      },
    ],
    headerConfig: {},
    footerConfig: {},
  },
  {
    id: 'luxury-premium',
    name: 'Luxury Premium',
    description: 'High-end design for premium products',
    category: 'ecommerce',
    thumbnail: 'https://placehold.co/400x300/FD79A8/white?text=Luxury+Premium',
    isPremium: true,
    sections: [
      {
        id: 'announce',
        type: 'announcement-bar',
        position: 0,
        visible: true,
        config: {
          text: 'Exclusive Collection - Limited Edition',
          backgroundColor: '#2D3436',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'hero',
        type: 'hero',
        position: 1,
        visible: true,
        config: {
          headline: 'Exquisite Craftsmanship',
          subheadline: 'Where luxury meets perfection',
          showPrice: true,
          showComparePrice: true,
          badgeText: 'Limited',
        },
      },
      {
        id: 'features',
        type: 'features',
        position: 2,
        visible: true,
        config: {
          title: 'Uncompromising Quality',
          features: [
            { icon: 'gem', title: 'Premium Materials', description: 'Finest materials sourced globally' },
            { icon: 'award', title: 'Award Winning', description: 'Recognized excellence' },
            { icon: 'shield', title: 'Lifetime Warranty', description: 'We stand behind our craft' },
            { icon: 'package', title: 'Luxury Packaging', description: 'Gift-ready presentation' },
          ],
        },
      },
      {
        id: 'social-proof',
        type: 'social-proof',
        position: 3,
        visible: true,
        config: {
          title: 'Trusted by Connoisseurs',
          averageRating: 5.0,
          reviewCount: 850,
          reviews: [
            { name: 'Victoria S.', rating: 5, text: 'Absolutely stunning quality!', verified: true },
            { name: 'James W.', rating: 5, text: 'Worth every penny.', verified: true },
          ],
        },
      },
      {
        id: 'cta',
        type: 'sticky-cta',
        position: 4,
        visible: true,
        config: {
          text: 'Acquire Now',
          backgroundColor: '#FD79A8',
          textColor: '#FFFFFF',
        },
      },
    ],
    headerConfig: {},
    footerConfig: {},
  },
  {
    id: 'problem-solution',
    name: 'Problem-Solution',
    description: 'Story-driven sales page with problem-agitate-solve framework',
    category: 'ecommerce',
    thumbnail: 'https://placehold.co/400x300/FDCB6E/2D3436?text=Problem+Solution',
    sections: [
      {
        id: 'hero',
        type: 'hero',
        position: 0,
        visible: true,
        config: {
          headline: 'Finally, a Real Solution',
          subheadline: 'Stop struggling and start succeeding',
          showPrice: true,
        },
      },
      {
        id: 'problem',
        type: 'problem',
        position: 1,
        visible: true,
        config: {
          title: 'Are You Tired Of...?',
          description: 'The same old solutions that never work. Products that overpromise and underdeliver.',
          imageUrl: 'https://placehold.co/600x400/DFE6E9/2D3436?text=The+Problem',
        },
      },
      {
        id: 'solution',
        type: 'solution',
        position: 2,
        visible: true,
        config: {
          title: 'Introducing the Answer',
          description: 'Our proven system that actually works. Backed by science, loved by thousands.',
          imageUrl: 'https://placehold.co/600x400/FDCB6E/2D3436?text=The+Solution',
        },
      },
      {
        id: 'features',
        type: 'features',
        position: 3,
        visible: true,
        config: {
          title: 'How It Works',
          features: [
            { icon: '1', title: 'Step One', description: 'Simple first action' },
            { icon: '2', title: 'Step Two', description: 'Build momentum' },
            { icon: '3', title: 'Step Three', description: 'See results' },
          ],
        },
      },
      {
        id: 'social-proof',
        type: 'social-proof',
        position: 4,
        visible: true,
        config: {
          title: 'Real Results from Real People',
          averageRating: 4.9,
          reviewCount: 3200,
          reviews: [
            { name: 'Michael P.', rating: 5, text: 'Changed my life!', verified: true },
            { name: 'Jessica L.', rating: 5, text: 'I wish I found this sooner.', verified: true },
          ],
        },
      },
      {
        id: 'faq',
        type: 'faq',
        position: 5,
        visible: true,
        config: {
          title: 'Common Questions',
          items: [
            { question: 'Does it really work?', answer: 'Yes! We have thousands of success stories.' },
            { question: 'How fast will I see results?', answer: 'Most customers see results within 7-14 days.' },
          ],
        },
      },
      {
        id: 'cta',
        type: 'sticky-cta',
        position: 6,
        visible: true,
        config: {
          text: 'Get Started Now',
          backgroundColor: '#FDCB6E',
          textColor: '#2D3436',
        },
      },
    ],
    headerConfig: {},
    footerConfig: {},
  },
];
