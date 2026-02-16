'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Check, Link2, Sparkles } from 'lucide-react';

interface UTMLinkGeneratorProps {
  baseUrl: string;
}

interface UTMParams {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

const PRESET_CAMPAIGNS = [
  {
    name: 'Email Newsletter',
    params: { source: 'newsletter', medium: 'email', campaign: 'monthly', term: '', content: '' },
  },
  {
    name: 'Facebook Ad',
    params: { source: 'facebook', medium: 'social_ad', campaign: 'product_launch', term: '', content: '' },
  },
  {
    name: 'Google Search',
    params: { source: 'google', medium: 'cpc', campaign: 'brand_search', term: '', content: '' },
  },
  {
    name: 'Instagram Story',
    params: { source: 'instagram', medium: 'social', campaign: 'story_promo', term: '', content: '' },
  },
];

export function UTMLinkGenerator({ baseUrl }: UTMLinkGeneratorProps) {
  const [utmParams, setUtmParams] = useState<UTMParams>({
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
  });
  const [copied, setCopied] = useState(false);

  const generateUTMLink = (): string => {
    const params = new URLSearchParams();

    if (utmParams.source) params.append('utm_source', utmParams.source);
    if (utmParams.medium) params.append('utm_medium', utmParams.medium);
    if (utmParams.campaign) params.append('utm_campaign', utmParams.campaign);
    if (utmParams.term) params.append('utm_term', utmParams.term);
    if (utmParams.content) params.append('utm_content', utmParams.content);

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const utmLink = generateUTMLink();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(utmLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const applyPreset = (params: Partial<UTMParams>) => {
    setUtmParams({ ...utmParams, ...params });
  };

  const clearAll = () => {
    setUtmParams({
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: '',
    });
  };

  return (
    <Card>
      <CardContent>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-surface-100">
              <Link2 className="h-5 w-5 text-brand-600" />
              UTM Link Generator
            </h3>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              Create trackable links for your marketing campaigns
            </p>
          </div>

          {/* Preset Campaigns */}
          <div>
            <label className="mb-2 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_CAMPAIGNS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.params)}
                  className="flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:border-brand-600 dark:hover:bg-brand-900/20"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* UTM Parameters */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Campaign Source <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., google, newsletter, facebook"
                value={utmParams.source}
                onChange={(e) => setUtmParams({ ...utmParams, source: e.target.value })}
              />
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                Identify the advertiser, site, publication, etc.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Campaign Medium <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., email, social, cpc, banner"
                value={utmParams.medium}
                onChange={(e) => setUtmParams({ ...utmParams, medium: e.target.value })}
              />
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                Advertising or marketing medium
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., summer_sale, product_launch"
                value={utmParams.campaign}
                onChange={(e) => setUtmParams({ ...utmParams, campaign: e.target.value })}
              />
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                Product, promo code, or slogan
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Campaign Term <span className="text-surface-400">(optional)</span>
              </label>
              <Input
                placeholder="e.g., running_shoes, blue_widgets"
                value={utmParams.term}
                onChange={(e) => setUtmParams({ ...utmParams, term: e.target.value })}
              />
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                Identify paid search keywords
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                Campaign Content <span className="text-surface-400">(optional)</span>
              </label>
              <Input
                placeholder="e.g., header_link, sidebar_cta"
                value={utmParams.content}
                onChange={(e) => setUtmParams({ ...utmParams, content: e.target.value })}
              />
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">
                Differentiate similar content or links
              </p>
            </div>
          </div>

          {/* Generated Link */}
          <div>
            <label className="mb-2 block text-sm font-medium text-surface-700 dark:text-surface-300">
              Generated Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 overflow-hidden rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800">
                <p className="break-all text-sm font-mono text-surface-900 dark:text-surface-100">
                  {utmLink}
                </p>
              </div>
              <Button
                variant="secondary"
                leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                onClick={copyToClipboard}
                disabled={!utmParams.source || !utmParams.medium || !utmParams.campaign}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-surface-200 pt-4 dark:border-surface-700">
            <Button variant="secondary" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
