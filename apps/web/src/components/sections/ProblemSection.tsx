'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { AlertCircle } from 'lucide-react';
import { getIcon } from './icon-map';
import type { SectionPreviewProps } from './types';

interface ProblemItem {
  icon: string;
  text: string;
}

export function ProblemSection({ config }: SectionPreviewProps) {
  const title =
    (config.title as string) || 'Are You Struggling With These Problems?';
  const description =
    (config.description as string) ||
    'Many people face these challenges every day. You are not alone.';
  const imageUrl = config.imageUrl as string | undefined;
  const items = (config.items as ProblemItem[]) || [];

  return (
    <section className="w-full bg-surface-50 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700">
              <AlertCircle className="h-4 w-4" />
              The Problem
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
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
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

          {/* Image */}
          <div className="flex justify-center lg:justify-end">
            {imageUrl ? (
              <div className="overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={imageUrl}
                  alt="Problem illustration"
                  className="h-auto w-full max-w-lg object-cover"
                />
              </div>
            ) : (
              <div
                className={cn(
                  'aspect-[4/3] w-full max-w-lg rounded-2xl',
                  'bg-gradient-to-br from-red-50 to-red-100',
                  'flex items-center justify-center shadow-lg'
                )}
              >
                <div className="text-center space-y-3 px-8">
                  <div className="mx-auto h-16 w-16 rounded-full bg-red-200/60 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  </div>
                  <p className="text-sm font-medium text-red-400">
                    Problem Illustration
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
