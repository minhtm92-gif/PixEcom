'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { CheckCircle, Sparkles } from 'lucide-react';
import { getIcon } from './icon-map';
import type { SectionPreviewProps } from './types';

interface SolutionItem {
  icon: string;
  text: string;
}

export function SolutionSection({ config }: SectionPreviewProps) {
  const title =
    (config.title as string) || 'Here\'s The Solution You\'ve Been Looking For';
  const description =
    (config.description as string) ||
    'Our product is specifically designed to address these challenges head-on.';
  const imageUrl = config.imageUrl as string | undefined;
  const items = (config.items as SolutionItem[]) || [];

  return (
    <section className="w-full bg-white py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image (left on desktop) */}
          <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
            {imageUrl ? (
              <div className="overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={imageUrl}
                  alt="Solution illustration"
                  className="h-auto w-full max-w-lg object-cover"
                />
              </div>
            ) : (
              <div
                className={cn(
                  'aspect-[4/3] w-full max-w-lg rounded-2xl',
                  'bg-gradient-to-br from-green-50 to-emerald-100',
                  'flex items-center justify-center shadow-lg'
                )}
              >
                <div className="text-center space-y-3 px-8">
                  <div className="mx-auto h-16 w-16 rounded-full bg-green-200/60 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-green-500">
                    Solution Illustration
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Text content (right on desktop) */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
              <CheckCircle className="h-4 w-4" />
              The Solution
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-surface-900 leading-tight">
              {title}
            </h2>

            <p className="text-base sm:text-lg text-surface-600 leading-relaxed">
              {description}
            </p>

            {items.length > 0 && (
              <ul className="space-y-4 pt-2">
                {items.map((item, idx) => {
                  const IconComponent = getIcon(item.icon);
                  return (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="text-surface-700 leading-relaxed pt-1">
                        {item.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
