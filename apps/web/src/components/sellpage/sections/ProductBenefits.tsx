'use client';

import React from 'react';

export interface ProductBenefitsData {
  type: 'product-benefits';
  title?: string;
  benefits: Array<{
    icon?: string;
    image?: string;
    title: string;
    description: string;
  }>;
  backgroundColor?: string;
}

interface ProductBenefitsProps {
  data: ProductBenefitsData;
  isPreview?: boolean;
}

export function ProductBenefits({ data, isPreview = false }: ProductBenefitsProps) {
  const bgColor = data.backgroundColor || '#f7f7f7';

  return (
    <div className="py-16" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {data.title && (
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">{data.title}</h2>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.benefits.map((benefit, index) => (
            <div key={index} className="rounded-lg bg-white p-6 shadow-sm">
              {/* Image or Icon */}
              {benefit.image ? (
                <div className="mb-4 aspect-video overflow-hidden rounded-lg">
                  <img
                    src={benefit.image}
                    alt={benefit.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : benefit.icon ? (
                <div className="mb-4 text-4xl">{benefit.icon}</div>
              ) : null}

              {/* Title */}
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{benefit.title}</h3>

              {/* Description */}
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
