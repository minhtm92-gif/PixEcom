'use client';

import React from 'react';
import { AnnouncementBar, AnnouncementBarData } from './sections/AnnouncementBar';
import { ProductHero, ProductHeroData } from './sections/ProductHero';
import { SocialProof, SocialProofData } from './sections/SocialProof';
import { ProductBenefits, ProductBenefitsData } from './sections/ProductBenefits';
import { ReviewsSection, ReviewsSectionData } from './sections/ReviewsSection';
import { ProductDescription, ProductDescriptionData } from './sections/ProductDescription';

export type SectionData =
  | AnnouncementBarData
  | ProductHeroData
  | SocialProofData
  | ProductBenefitsData
  | ReviewsSectionData
  | ProductDescriptionData;

interface SectionRendererProps {
  sections: SectionData[];
  product: any;
  reviews?: any[];
  isPreview?: boolean;
}

export function SectionRenderer({ sections, product, reviews = [], isPreview = false }: SectionRendererProps) {
  // Filter out invalid/empty sections
  const validSections = sections.filter(section => section && typeof section === 'object' && section.type);

  // Show empty state if no valid sections
  if (validSections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Content Yet</h2>
          <p className="text-gray-600 mb-4">
            This sellpage doesn't have any sections yet. {isPreview ? 'Add sections in the page builder to see them here.' : ''}
          </p>
          {product && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600">${product.basePrice} {product.currency}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {validSections.map((section, index) => {
        switch (section.type) {
          case 'announcement-bar':
            return <AnnouncementBar key={index} data={section} isPreview={isPreview} />;

          case 'product-hero':
            return <ProductHero key={index} data={section} product={product} isPreview={isPreview} />;

          case 'social-proof':
            return <SocialProof key={index} data={section} isPreview={isPreview} />;

          case 'product-benefits':
            return <ProductBenefits key={index} data={section} isPreview={isPreview} />;

          case 'reviews-section':
            return <ReviewsSection key={index} data={section} reviews={reviews} isPreview={isPreview} />;

          case 'product-description':
            return <ProductDescription key={index} data={section} product={product} isPreview={isPreview} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
