'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { SectionPreviewProps } from './types';

interface FaqItem {
  question: string;
  answer: string;
}

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        isOpen
          ? 'border-brand-200 bg-brand-50/30 shadow-sm'
          : 'border-surface-200 bg-white hover:border-surface-300'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between gap-4 px-6 py-5 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          'rounded-xl'
        )}
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            'text-base font-semibold leading-snug',
            isOpen ? 'text-brand-700' : 'text-surface-900'
          )}
        >
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 flex-shrink-0 transition-transform duration-200',
            isOpen ? 'rotate-180 text-brand-600' : 'text-surface-400'
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-5 pt-0">
            <p className="text-sm leading-relaxed text-surface-600">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqSection({ config }: SectionPreviewProps) {
  const title =
    (config.title as string) || 'Frequently Asked Questions';
  const items = (config.items as FaqItem[]) || [];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = useCallback((idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section className="w-full bg-surface-50 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
            <HelpCircle className="h-6 w-6 text-brand-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-surface-900 leading-tight">
            {title}
          </h2>
        </div>

        {/* FAQ items */}
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <FaqAccordionItem
                key={idx}
                item={item}
                isOpen={openIndex === idx}
                onToggle={() => handleToggle(idx)}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="space-y-3">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="rounded-xl border-2 border-dashed border-surface-300 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-48 rounded bg-surface-200" />
                  <div className="h-5 w-5 rounded bg-surface-200" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
