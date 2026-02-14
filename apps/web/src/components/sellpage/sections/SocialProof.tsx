'use client';

import React from 'react';
import { Star, Eye, ShoppingBag } from 'lucide-react';

export interface SocialProofData {
  type: 'social-proof';
  viewerCount?: number;
  purchaseCount?: number;
  showLiveCounter?: boolean;
}

interface SocialProofProps {
  data: SocialProofData;
  isPreview?: boolean;
}

export function SocialProof({ data, isPreview = false }: SocialProofProps) {
  if (!data.showLiveCounter) return null;

  return (
    <div className="border-t border-b border-gray-200 bg-white py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          {data.viewerCount && (
            <div className="flex items-center gap-2 text-gray-600">
              <Eye className="h-4 w-4" />
              <span>
                <strong className="font-semibold text-gray-900">{data.viewerCount}</strong> people viewing
              </span>
            </div>
          )}

          {data.purchaseCount && (
            <div className="flex items-center gap-2 text-gray-600">
              <ShoppingBag className="h-4 w-4" />
              <span>
                <strong className="font-semibold text-gray-900">{data.purchaseCount}</strong> purchased
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
