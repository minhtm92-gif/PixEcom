import React from 'react';
import { AnnouncementBarEditor } from './AnnouncementBarEditor';
import { HeroEditor } from './HeroEditor';
import { ProblemEditor } from './ProblemEditor';
import { SolutionEditor } from './SolutionEditor';
import { FeaturesEditor } from './FeaturesEditor';
import { SocialProofEditor } from './SocialProofEditor';
import { PricingEditor } from './PricingEditor';
import { FaqEditor } from './FaqEditor';
import { StickyCtaEditor } from './StickyCtaEditor';
import { CountdownTimerEditor } from './CountdownTimerEditor';
import { FeaturedProductEditor } from './FeaturedProductEditor';
import { GuaranteeEditor } from './GuaranteeEditor';
import { FooterEditor } from './FooterEditor';
import { ReviewsEditor } from './ReviewsEditor';
import { ProductDescriptionEditor } from './ProductDescriptionEditor';

// Re-export all editors
export {
  AnnouncementBarEditor,
  HeroEditor,
  ProblemEditor,
  SolutionEditor,
  FeaturesEditor,
  SocialProofEditor,
  PricingEditor,
  FaqEditor,
  StickyCtaEditor,
  CountdownTimerEditor,
  FeaturedProductEditor,
  GuaranteeEditor,
  FooterEditor,
  ReviewsEditor,
  ProductDescriptionEditor,
};

// Shared type for all section editors
export interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

// Registry mapping section type strings to their editor components
export const editorRegistry: Record<string, React.ComponentType<SectionEditorProps>> = {
  'announcement-bar': AnnouncementBarEditor,
  'hero': HeroEditor,
  'problem': ProblemEditor,
  'solution': SolutionEditor,
  'features': FeaturesEditor,
  'social-proof': SocialProofEditor,
  'pricing': PricingEditor,
  'faq': FaqEditor,
  'sticky-cta': StickyCtaEditor,
  'countdown-timer': CountdownTimerEditor,
  'featured-product': FeaturedProductEditor,
  'guarantee': GuaranteeEditor,
  'footer': FooterEditor,
  'reviews': ReviewsEditor,
  'product-description': ProductDescriptionEditor,
};
