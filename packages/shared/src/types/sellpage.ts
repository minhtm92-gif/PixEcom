import { SectionConfig } from './store';

export interface SellpageDto {
  id: string;
  workspaceId: string;
  storeId: string;
  productId: string;
  slug: string;
  subdomain: string | null;
  customDomain: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  titleOverride: string | null;
  descriptionOverride: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoOgImage: string | null;
  sections: SectionConfig[];
  headerConfig: Record<string, unknown>;
  footerConfig: Record<string, unknown>;
  boostModules: BoostModule[];
  discountRules: DiscountRule[];
}

export interface BoostModule {
  type: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface DiscountRule {
  minQty: number;
  extraPercent: number;
}

export type SellpageSectionType =
  | 'announcement-bar'
  | 'hero'
  | 'problem'
  | 'solution'
  | 'features'
  | 'social-proof'
  | 'pricing'
  | 'faq'
  | 'sticky-cta'
  | 'countdown-timer';

export type HomepageSectionType =
  | 'hero'
  | 'featured-product'
  | 'reviews'
  | 'guarantee'
  | 'footer';
