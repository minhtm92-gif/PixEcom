'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import type { SectionPreviewProps } from './types';

interface FooterLink {
  label: string;
  url: string;
}

export function FooterSection({ config }: SectionPreviewProps) {
  const copyright =
    (config.copyright as string) ||
    `\u00A9 ${new Date().getFullYear()} Your Store. All rights reserved.`;
  const links = (config.links as FooterLink[]) || [];

  return (
    <footer className="w-full bg-surface-900 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6">
          {/* Links */}
          {links.length > 0 && (
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  className={cn(
                    'text-sm text-surface-400 transition-colors duration-200',
                    'hover:text-white',
                    'focus-visible:outline-none focus-visible:text-white'
                  )}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Divider */}
          {links.length > 0 && (
            <div className="w-full max-w-xs border-t border-surface-800" />
          )}

          {/* Copyright */}
          <p className="text-center text-sm text-surface-500">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
