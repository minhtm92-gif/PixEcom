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
  headerSlot?: React.ReactNode;
}

export function SectionRenderer({ sections, product, reviews = [], isPreview = false, headerSlot }: SectionRendererProps) {
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

  const renderedSections: React.ReactNode[] = [];
  let headerInjected = !headerSlot; // if no headerSlot, skip injection

  validSections.forEach((section, index) => {
    let rendered: React.ReactNode = null;

    switch (section.type) {
      case 'announcement-bar':
        rendered = <AnnouncementBar key={index} data={section} isPreview={isPreview} />;
        break;
      case 'product-hero':
        rendered = <ProductHero key={index} data={section} product={product} isPreview={isPreview} />;
        break;
      case 'social-proof':
        rendered = <SocialProof key={index} data={section} isPreview={isPreview} />;
        break;
      case 'product-benefits':
        rendered = <ProductBenefits key={index} data={section} isPreview={isPreview} />;
        break;
      case 'reviews-section':
        rendered = <ReviewsSection key={index} data={section} reviews={reviews} isPreview={isPreview} />;
        break;
      case 'product-description':
        rendered = <ProductDescription key={index} data={section} product={product} isPreview={isPreview} />;
        break;
      default:
        rendered = null;
    }

    if (rendered) {
      renderedSections.push(rendered);
    }

    // Inject the header slot after the first announcement-bar section
    if (!headerInjected && section.type === 'announcement-bar') {
      renderedSections.push(
        <React.Fragment key={`header-slot-${index}`}>{headerSlot}</React.Fragment>
      );
      headerInjected = true;
    }
  });

  // If there was no announcement-bar but we have a headerSlot, inject at top
  if (!headerInjected && headerSlot) {
    renderedSections.unshift(
      <React.Fragment key="header-slot-top">{headerSlot}</React.Fragment>
    );
  }

  return (
    <div className="min-h-screen">
      {renderedSections}
    </div>
  );
}
