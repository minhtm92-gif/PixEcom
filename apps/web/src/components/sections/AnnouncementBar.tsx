'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { ExternalLink } from 'lucide-react';
import type { SectionPreviewProps } from './types';

export function AnnouncementBar({ config }: SectionPreviewProps) {
  const text = (config.text as string) || 'Free shipping on all orders over $50!';
  const backgroundColor = (config.backgroundColor as string) || '#4c6ef5';
  const textColor = (config.textColor as string) || '#ffffff';
  const link = config.link as string | undefined;

  const content = (
    <div
      className={cn(
        'w-full py-2.5 px-4 text-center text-sm font-medium',
        'transition-colors duration-200'
      )}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-2">
        <span>{text}</span>
        {link && (
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <a
        href={link}
        className="block no-underline hover:opacity-90 transition-opacity"
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return content;
}
