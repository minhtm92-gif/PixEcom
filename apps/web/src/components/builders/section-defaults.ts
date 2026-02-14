/**
 * Default configurations for each section type.
 * When a new section is added via the builder, it receives these defaults.
 */
export const sectionDefaults: Record<string, Record<string, unknown>> = {
  'announcement-bar': {
    text: 'FREE SHIPPING ON ALL ORDERS!',
    backgroundColor: '#FF6B6B',
    textColor: '#FFFFFF',
  },
  hero: {
    headline: 'Your Product Name',
    subheadline: 'A compelling description of your product',
    showPrice: true,
    showComparePrice: true,
  },
  problem: {
    title: 'The Problem',
    description: 'Describe the problem your product solves',
    items: [],
  },
  solution: {
    title: 'The Solution',
    description: 'Explain how your product solves the problem',
    items: [],
  },
  features: {
    title: 'Key Features',
    columns: 3,
    features: [
      { icon: 'zap', title: 'Feature 1', description: 'Description of feature 1' },
      { icon: 'shield', title: 'Feature 2', description: 'Description of feature 2' },
      { icon: 'star', title: 'Feature 3', description: 'Description of feature 3' },
    ],
  },
  'social-proof': {
    title: 'What Our Customers Say',
    averageRating: 4.8,
    reviewCount: 500,
    reviews: [
      { name: 'Customer Name', rating: 5, text: 'Amazing product!', verified: true },
    ],
  },
  pricing: {
    title: 'Special Offer',
    showComparePrice: true,
    showDiscount: true,
    ctaText: 'Buy Now',
  },
  faq: {
    title: 'Frequently Asked Questions',
    items: [
      { question: 'What is the return policy?', answer: '30-day money-back guarantee.' },
    ],
  },
  'sticky-cta': {
    text: 'Add to Cart',
    backgroundColor: '#2563EB',
    textColor: '#FFFFFF',
  },
  'countdown-timer': {
    title: 'Limited Time Offer',
    backgroundColor: '#1F2937',
    textColor: '#FFFFFF',
  },
  'featured-product': {
    title: 'Featured Products',
    maxProducts: 4,
  },
  reviews: {
    title: 'Customer Reviews',
    reviews: [
      { name: 'Happy Customer', rating: 5, text: 'Great experience!', verified: true },
    ],
  },
  guarantee: {
    title: 'Our Guarantee',
    items: [
      { icon: 'shield', title: '30-Day Money Back', description: 'No questions asked' },
      { icon: 'truck', title: 'Free Shipping', description: 'On all orders' },
      { icon: 'headphones', title: '24/7 Support', description: 'We\'re here to help' },
    ],
  },
  footer: {
    copyright: '\u00A9 2024 Your Store. All rights reserved.',
    links: [],
  },
};
