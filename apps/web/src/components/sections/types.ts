export interface SectionPreviewProps {
  config: Record<string, unknown>;
  product?: {
    name: string;
    basePrice: number;
    compareAtPrice?: number;
    currency?: string;
    media?: { url: string; altText?: string; isPrimary?: boolean }[];
  };
  isPreview?: boolean;
}

export interface SectionConfig {
  id: string;
  type: string;
  position: number;
  visible: boolean;
  config: Record<string, unknown>;
}
