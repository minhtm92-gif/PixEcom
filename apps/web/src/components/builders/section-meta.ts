/**
 * Human-readable metadata for each section type.
 * Used by the section list panel and add-section modal.
 */
export interface SectionMeta {
  type: string;
  label: string;
  icon: string; // lucide icon name
  description: string;
  category: 'sellpage' | 'homepage' | 'both';
}

export const sectionMeta: SectionMeta[] = [
  {
    type: 'announcement-bar',
    label: 'Announcement Bar',
    icon: 'megaphone',
    description: 'Top banner for promotions or announcements',
    category: 'sellpage',
  },
  {
    type: 'hero',
    label: 'Hero',
    icon: 'layout',
    description: 'Large header with headline, image, and CTA',
    category: 'both',
  },
  {
    type: 'problem',
    label: 'Problem',
    icon: 'alert-circle',
    description: 'Highlight the pain points your product solves',
    category: 'sellpage',
  },
  {
    type: 'solution',
    label: 'Solution',
    icon: 'lightbulb',
    description: 'Show how your product solves the problem',
    category: 'sellpage',
  },
  {
    type: 'features',
    label: 'Features',
    icon: 'grid',
    description: 'Showcase key product features in a grid',
    category: 'sellpage',
  },
  {
    type: 'social-proof',
    label: 'Social Proof',
    icon: 'users',
    description: 'Customer reviews and testimonials',
    category: 'sellpage',
  },
  {
    type: 'pricing',
    label: 'Pricing',
    icon: 'tag',
    description: 'Product pricing with discount display',
    category: 'sellpage',
  },
  {
    type: 'faq',
    label: 'FAQ',
    icon: 'help-circle',
    description: 'Frequently asked questions accordion',
    category: 'sellpage',
  },
  {
    type: 'sticky-cta',
    label: 'Sticky CTA',
    icon: 'arrow-up',
    description: 'Fixed call-to-action bar at page bottom',
    category: 'sellpage',
  },
  {
    type: 'countdown-timer',
    label: 'Countdown Timer',
    icon: 'clock',
    description: 'Urgency timer for limited offers',
    category: 'sellpage',
  },
  {
    type: 'featured-product',
    label: 'Featured Products',
    icon: 'shopping-bag',
    description: 'Display highlighted products from your store',
    category: 'homepage',
  },
  {
    type: 'reviews',
    label: 'Reviews',
    icon: 'star',
    description: 'Customer reviews and ratings',
    category: 'homepage',
  },
  {
    type: 'guarantee',
    label: 'Guarantee',
    icon: 'shield-check',
    description: 'Trust badges and guarantee promises',
    category: 'homepage',
  },
  {
    type: 'footer',
    label: 'Footer',
    icon: 'layers',
    description: 'Page footer with links and copyright',
    category: 'homepage',
  },
];

/** Lookup a single SectionMeta by type string */
export function getSectionMeta(type: string): SectionMeta | undefined {
  return sectionMeta.find((m) => m.type === type);
}

/** Get SectionMeta entries filtered to the given list of type strings */
export function getSectionMetaForTypes(types: string[]): SectionMeta[] {
  const set = new Set(types);
  return sectionMeta.filter((m) => set.has(m.type));
}
