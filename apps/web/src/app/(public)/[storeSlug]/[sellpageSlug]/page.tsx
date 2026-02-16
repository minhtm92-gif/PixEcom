import { notFound } from 'next/navigation';
import { SectionRenderer } from '@/components/sellpage/SectionRenderer';
import { TrackingProvider } from '@/components/tracking/TrackingProvider';

interface PageProps {
  params: {
    storeSlug: string;
    sellpageSlug: string;
  };
}

async function getSellpageData(storeSlug: string, sellpageSlug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/public/stores/${storeSlug}/sellpages/${sellpageSlug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
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

  const { sellpage, product, reviews } = data;

  // If sellpage is not published, show 404
  if (sellpage.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <>
      {/* Tracking Pixels */}
      <TrackingProvider
        facebookPixelId={sellpage.facebookPixelId}
        tiktokPixelId={sellpage.tiktokPixelId}
        googleAnalyticsId={sellpage.googleAnalyticsId}
        googleTagManagerId={sellpage.googleTagManagerId}
      />

      <div className="min-h-screen bg-white">
        {/* Render page sections */}
        <SectionRenderer
          sections={sellpage.sections || []}
          product={product}
          reviews={reviews}
          isPreview={false}
        />
      </div>
    </>
  );
}
