export interface ProductDto {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  currency: string;
  sku: string | null;
  description: string | null;
  descriptionBlocks: DescriptionBlock[];
  shippingInfo: Record<string, unknown>;
  tags: string[];
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  variants: VariantDto[];
  media: MediaDto[];
}

export interface VariantDto {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  priceOverride: number | null;
  compareAtPrice: number | null;
  options: Record<string, string>;
  stockQuantity: number;
  isActive: boolean;
  position: number;
}

export interface MediaDto {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  mediaType: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface DescriptionBlock {
  type: string;
  content: string;
}
