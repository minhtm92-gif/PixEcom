'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { getIcon } from './icon-map';
import type { SectionPreviewProps } from './types';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export function FeaturesSection({ config }: SectionPreviewProps) {
  const title = (config.title as string) || 'Why Choose Us';
  const columns = (config.columns as number) || 3;
  const features = (config.features as FeatureItem[]) || [];

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[Math.min(Math.max(columns, 1), 4)] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="w-full bg-white py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-surface-900 leading-tight">
            {title}
          </h2>
        </div>

        {/* Features grid */}
        <div className={cn('grid gap-6 md:gap-8', gridCols)}>
          {features.map((feature, idx) => {
            const IconComponent = getIcon(feature.icon);
            return (
              <div
                key={idx}
                className={cn(
                  'group relative rounded-2xl border border-surface-200 bg-white p-6 md:p-8',
                  'transition-all duration-300',
                  'hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/50',
                  'hover:-translate-y-1'
                )}
              >
                <div
                  className={cn(
                    'mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl',
                    'bg-brand-50 text-brand-600',
                    'transition-colors duration-300',
                    'group-hover:bg-brand-100'
                  )}
                >
                  <IconComponent className="h-6 w-6" />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-surface-900">
                  {feature.title}
                </h3>

                <p className="text-sm leading-relaxed text-surface-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Empty state for builder */}
        {features.length === 0 && (
          <div className={cn('grid gap-6 md:gap-8', gridCols)}>
            {Array.from({ length: columns }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border-2 border-dashed border-surface-300 bg-surface-50 p-8 text-center"
              >
                <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-surface-200 flex items-center justify-center">
                  <div className="h-6 w-6 rounded bg-surface-300" />
                </div>
                <div className="mx-auto mb-2 h-5 w-24 rounded bg-surface-200" />
                <div className="mx-auto h-4 w-40 rounded bg-surface-200" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
