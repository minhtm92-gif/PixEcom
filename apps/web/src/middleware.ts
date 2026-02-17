import { NextRequest, NextResponse } from 'next/server';

// Main domains that should NOT be treated as custom domains
const MAIN_DOMAINS = [
  'pixecom.pixelxlab.com',
  'localhost',
  '127.0.0.1',
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

async function lookupDomain(domain: string) {
  const response = await fetch(`${API_URL}/public/domains/${domain}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 60 },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.data || data;
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Remove port from hostname for comparison
  const domain = hostname.split(':')[0];

  // Check if this is a main domain (admin/app domain)
  const isMainDomain = MAIN_DOMAINS.some(mainDomain =>
    domain === mainDomain || domain.endsWith(`.${mainDomain}`)
  );

  // If it's the main domain, let it through normally
  if (isMainDomain) {
    return NextResponse.next();
  }

  // Pass through internal paths
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname.match(/^\/(login|register)/)
  ) {
    return NextResponse.next();
  }

  try {
    // First, try the full domain (e.g. circlekar.com OR stretchactive.circlekar.com)
    let domainData = await lookupDomain(domain);
    let sellpageSlugFromSubdomain: string | null = null;

    // If not found, check if it's a subdomain and try the parent domain
    if (!domainData) {
      const parts = domain.split('.');
      if (parts.length > 2) {
        // e.g. stretchactive.circlekar.com → parent is circlekar.com
        const subdomain = parts[0];
        const parentDomain = parts.slice(1).join('.');
        domainData = await lookupDomain(parentDomain);
        if (domainData) {
          // Use subdomain as the sellpage slug
          sellpageSlugFromSubdomain = subdomain;
        }
      }
    }

    if (!domainData) {
      // Domain not found or not verified
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    const storeSlug = domainData?.store?.slug;
    if (!storeSlug) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    // If this came from a subdomain (e.g. stretchactive.circlekar.com),
    // route directly to that sellpage regardless of pathname
    if (sellpageSlugFromSubdomain) {
      return NextResponse.rewrite(
        new URL(`/${storeSlug}/${sellpageSlugFromSubdomain}`, request.url)
      );
    }

    // Root path on custom domain: use primarySellpage
    if (url.pathname === '/' || url.pathname === '') {
      const primarySellpage = domainData?.store?.primarySellpage;
      if (primarySellpage) {
        return NextResponse.rewrite(new URL(`/${storeSlug}/${primarySellpage}`, request.url));
      }
      return NextResponse.rewrite(new URL(`/${storeSlug}`, request.url));
    }

    // Subpath on custom domain: treat as sellpage slug
    const pathSegments = url.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 1) {
      return NextResponse.rewrite(new URL(`/${storeSlug}/${pathSegments[0]}`, request.url));
    }

    return NextResponse.next();

  } catch (error) {
    console.error('Error in custom domain middleware:', error, 'domain:', domain, 'API_URL:', API_URL);
    return NextResponse.rewrite(new URL('/404', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
