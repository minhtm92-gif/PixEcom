'use client';

import React from 'react';

export interface ProductDescriptionData {
  type: 'product-description';
  title?: string;
  showTitle?: boolean;
  backgroundColor?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

interface ProductDescriptionProps {
  data: ProductDescriptionData;
  product: any;
  isPreview?: boolean;
}

export function ProductDescription({ data, product, isPreview = false }: ProductDescriptionProps) {
  const title = data.title || 'Product Details';
  const showTitle = data.showTitle !== false;
  const backgroundColor = data.backgroundColor || '#ffffff';
  const maxWidth = data.maxWidth || 'lg';

  if (!product?.description) {
    if (isPreview) {
      return (
        <div className="py-12 bg-gray-50 border-2 border-dashed border-gray-300">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              No product description available. Add a description to your product to display it here.
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-7xl',
  };

  return (
    <section className="py-12 sm:py-16" style={{ backgroundColor }}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]}`}>
        {showTitle && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            {title}
          </h2>
        )}
        <div
          className="product-description-content"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </div>
      <style jsx>{`
        .product-description-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 15px;
          line-height: 1.7;
          color: #1b1b1b;
        }

        .product-description-content :global(h2),
        .product-description-content :global(h3) {
          color: #8e5303;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .product-description-content :global(h2) {
          font-size: 1.75rem;
        }

        .product-description-content :global(h3) {
          font-size: 1.375rem;
        }

        .product-description-content :global(p) {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .product-description-content :global(strong) {
          font-weight: 600;
          color: #211c18;
        }

        .product-description-content :global(em) {
          font-style: italic;
        }

        .product-description-content :global(img),
        .product-description-content :global(picture),
        .product-description-content :global(video) {
          max-width: 100%;
          height: auto;
          margin: 2rem auto;
          display: block;
        }

        .product-description-content :global(ul),
        .product-description-content :global(ol) {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }

        .product-description-content :global(li) {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </section>
  );
}
