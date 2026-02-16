import { NextRequest, NextResponse } from 'next/server';

// Main domains that should NOT be treated as custom domains
const MAIN_DOMAINS = [
  'pixecom.pixelxlab.com',
  'localhost',
  '127.0.0.1',
];

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

  // If it's already on a store page, let it through
  if (url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/static') ||
      url.pathname.match(/^\/(login|register)/)) {
    return NextResponse.next();
  }

  // This is a custom domain - look up which store owns it
  try {
    // Call API to find store by domain
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${apiUrl}/public/domains/${domain}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache to avoid hitting API on every request
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      // Domain not found or not verified - show 404
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    const data = await response.json();
    const storeSlug = data.store?.slug;

    if (!storeSlug) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    // If accessing root path, redirect to store's primary sellpage
    if (url.pathname === '/' || url.pathname === '') {
      // Find the store's primary sellpage or homepage
      const sellpageSlug = data.store?.primarySellpage || 'home';

      // Rewrite to the store's sellpage
      return NextResponse.rewrite(new URL(`/${storeSlug}/${sellpageSlug}`, request.url));
    }

    // If accessing a subpath, assume it's a sellpage slug
    const pathSegments = url.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 1) {
      // Rewrite /slug to /storeSlug/slug
      return NextResponse.rewrite(new URL(`/${storeSlug}/${pathSegments[0]}`, request.url));
    }

    // For other paths, let them through
    return NextResponse.next();

  } catch (error) {
    console.error('Error in custom domain middleware:', error);
    // On error, show 404
    return NextResponse.rewrite(new URL('/404', request.url));
  }
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
