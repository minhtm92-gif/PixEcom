import { notFound } from 'next/navigation';
import { SectionRenderer } from '@/components/sellpage/SectionRenderer';
import { TrackingProvider } from '@/components/tracking/TrackingProvider';
import { SellpageHeader } from '@/components/sellpage/SellpageHeader';
import { SellpageFooter } from '@/components/sellpage/SellpageFooter';
import { CartDrawer } from '@/components/sellpage/CartDrawer';

interface PageProps {
  params: {
    storeSlug: string;
    sellpageSlug: string;
  };
}

async function getSellpageData(storeSlug: string, sellpageSlug: string) {
  try {
    // Use internal URL on server to avoid going through nginx/SSL
    const apiUrl = 'http://localhost:3001/api';
    const res = await fetch(`${apiUrl}/public/stores/${storeSlug}/sellpages/${sellpageSlug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    // Unwrap { data: { sellpage, product, reviews } } → { sellpage, product, reviews }
    return json?.data || json;
  } catch (error) {
    console.error('Failed to fetch sellpage:', error);
    return null;
  }
}

export default async function PublicSellpagePage({ params }: PageProps) {
  const data = await getSellpageData(params.storeSlug, params.sellpageSlug);

  if (!data) {
    notFound();
  }

  const { sellpage, product, reviews, store, legalPolicies = [] } = data;

  // If sellpage is not published, show 404
  if (!sellpage || sellpage.status !== 'PUBLISHED') {
    notFound();
  }

  // Build the header component to inject after the announcement bar
  const headerSlot = store ? (
    <SellpageHeader
      store={store}
      sellpageSlug={sellpage.slug}
      legalPolicies={legalPolicies}
    />
  ) : null;

  return (
    <>
      {/* Tracking Pixels */}
      <TrackingProvider
        facebookPixelId={sellpage.facebookPixelId}
        tiktokPixelId={sellpage.tiktokPixelId}
        googleAnalyticsId={sellpage.googleAnalyticsId}
        googleTagManagerId={sellpage.googleTagManagerId}
      />

      <div className="min-h-screen bg-white flex flex-col">
        {/* SectionRenderer injects the header after the announcement-bar */}
        <main className="flex-1">
          <SectionRenderer
            sections={sellpage.sections || []}
            product={product}
            reviews={reviews}
            isPreview={false}
            headerSlot={headerSlot}
          />
        </main>

        {/* Footer */}
        {store && (
          <SellpageFooter
            store={store}
            legalPolicies={legalPolicies}
          />
        )}
      </div>

      {/* Cart Drawer - slides in from right */}
      <CartDrawer />
    </>
  );
}
