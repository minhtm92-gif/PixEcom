export interface StoreDto {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  primaryDomain: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  brandColor: string | null;
  currency: string;
  homepageTitle: string | null;
  homepageDescription: string | null;
  homepageConfig: SectionConfig[];
  themeConfig: Record<string, unknown>;
  isActive: boolean;
}

export interface SectionConfig {
  id: string;
  type: string;
  position: number;
  visible: boolean;
  config: Record<string, unknown>;
}
