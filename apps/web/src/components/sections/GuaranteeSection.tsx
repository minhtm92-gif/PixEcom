'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { getIcon } from './icon-map';
import type { SectionPreviewProps } from './types';

interface GuaranteeItem {
  icon: string;
  title: string;
  description: string;
}

export function GuaranteeSection({ config }: SectionPreviewProps) {
  const title = (config.title as string) || 'Our Guarantee';
  const items = (config.items as GuaranteeItem[]) || [];

  return (
    <section className="w-full bg-surface-50 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-surface-900 leading-tight">
            {title}
          </h2>
        </div>

        {/* Guarantee items */}
        {items.length > 0 ? (
          <div
            className={cn(
              'grid gap-8',
              items.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : items.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
                : items.length === 3
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            )}
          >
            {items.map((item, idx) => {
              const IconComponent = getIcon(item.icon);
              return (
                <div key={idx} className="text-center">
                  <div
                    className={cn(
                      'mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl',
                      'bg-brand-100 text-brand-600',
                      'shadow-sm'
                    )}
                  >
                    <IconComponent className="h-7 w-7" />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-surface-900">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-surface-600 max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="text-center">
                <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-surface-200 flex items-center justify-center">
                  <div className="h-7 w-7 rounded bg-surface-300" />
                </div>
                <div className="mx-auto mb-2 h-5 w-32 rounded bg-surface-200" />
                <div className="mx-auto h-4 w-48 rounded bg-surface-200" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
