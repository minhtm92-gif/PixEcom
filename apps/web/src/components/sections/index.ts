// Section preview components — imports
import { AnnouncementBar } from './AnnouncementBar';
import { HeroSection } from './HeroSection';
import { ProblemSection } from './ProblemSection';
import { SolutionSection } from './SolutionSection';
import { FeaturesSection } from './FeaturesSection';
import { SocialProofSection, StarRating, AvatarCircle } from './SocialProofSection';
import { PricingSection } from './PricingSection';
import { FaqSection } from './FaqSection';
import { StickyCta } from './StickyCta';
import { CountdownTimer } from './CountdownTimer';
import { FeaturedProduct } from './FeaturedProduct';
import { GuaranteeSection } from './GuaranteeSection';
import { FooterSection } from './FooterSection';
import { ProductDescription } from './ProductDescription';
import { getIcon, iconMap } from './icon-map';
import type { SectionPreviewProps, SectionConfig } from './types';
import type { ComponentType } from 'react';

// Re-export all components
export {
  AnnouncementBar,
  HeroSection,
  ProblemSection,
  SolutionSection,
  FeaturesSection,
  SocialProofSection,
  StarRating,
  AvatarCircle,
  PricingSection,
  FaqSection,
  StickyCta,
  CountdownTimer,
  FeaturedProduct,
  GuaranteeSection,
  FooterSection,
  ProductDescription,
  getIcon,
  iconMap,
};

// Re-export types
export type { SectionPreviewProps, SectionConfig };

/**
 * Maps section type strings to their preview components.
 * Use this in the page builder renderer and public storefront.
 */
export const sectionComponents: Record<string, ComponentType<SectionPreviewProps>> = {
  'announcement-bar': AnnouncementBar,
  'hero': HeroSection,
  'problem': ProblemSection,
  'solution': SolutionSection,
  'features': FeaturesSection,
  'social-proof': SocialProofSection,
  'reviews': SocialProofSection, // Homepage reviews uses the same component
  'pricing': PricingSection,
  'faq': FaqSection,
  'sticky-cta': StickyCta,
  'countdown-timer': CountdownTimer,
  'featured-product': FeaturedProduct,
  'guarantee': GuaranteeSection,
  'footer': FooterSection,
  'product-description': ProductDescription,
};

/**
 * Resolves a section type string to its preview component.
 * Returns null if the section type is not found.
 */
export function getSectionComponent(
  type: string
): ComponentType<SectionPreviewProps> | null {
  return sectionComponents[type] ?? null;
}
