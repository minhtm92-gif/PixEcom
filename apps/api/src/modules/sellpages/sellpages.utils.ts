import { Sellpage, Store } from '@prisma/client';

/**
 * Generate public URL for a sellpage
 * Priority order:
 * 1. Custom domain (if set)
 * 2. Subdomain (if set)
 * 3. Store primary domain + store slug + sellpage slug
 */
export function generateSellpageUrl(
  sellpage: Sellpage & { store?: Pick<Store, 'primaryDomain' | 'slug'> },
  store?: Pick<Store, 'primaryDomain' | 'slug'>,
): string {
  const storeData = sellpage.store || store;

  if (!storeData) {
    throw new Error('Store data is required to generate sellpage URL');
  }

  // Check for custom domain first
  if (sellpage.customDomain) {
    return `https://${sellpage.customDomain}/${sellpage.slug}`;
  }

  // Check for subdomain
  if (sellpage.subdomain) {
    return `https://${sellpage.subdomain}.${storeData.primaryDomain}/${sellpage.slug}`;
  }

  // Default: store primary domain + store slug + sellpage slug
  return `https://${storeData.primaryDomain}/${storeData.slug}/${sellpage.slug}`;
}

/**
 * Generate sellpage URL with UTM parameters
 */
export function generateSellpageUrlWithUtm(
  sellpage: Sellpage & { store?: Pick<Store, 'primaryDomain' | 'slug'> },
  store?: Pick<Store, 'primaryDomain' | 'slug'>,
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  },
): string {
  const baseUrl = generateSellpageUrl(sellpage, store);

  if (!utmParams) {
    return baseUrl;
  }

  const url = new URL(baseUrl);

  if (utmParams.source) url.searchParams.set('utm_source', utmParams.source);
  if (utmParams.medium) url.searchParams.set('utm_medium', utmParams.medium);
  if (utmParams.campaign) url.searchParams.set('utm_campaign', utmParams.campaign);
  if (utmParams.content) url.searchParams.set('utm_content', utmParams.content);
  if (utmParams.term) url.searchParams.set('utm_term', utmParams.term);

  return url.toString();
}
