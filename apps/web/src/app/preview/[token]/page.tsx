import { notFound } from 'next/navigation';
import { Clock, AlertCircle } from 'lucide-react';
import { SectionRenderer } from '@/components/sellpage/SectionRenderer';

interface PreviewPageProps {
  params: {
    token: string;
  };
}

async function getSellpagePreview(token: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/public/preview/${token}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    // Backend wraps response in { data, success } format
    return result.data || result;
  } catch (error) {
    console.error('Failed to fetch preview:', error);
    return null;
  }
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const data = await getSellpagePreview(params.token);

  if (!data) {
    notFound();
  }

  const { sellpage, product, reviews, expiresAt } = data;

  // Calculate days until expiry
  const calculateExpiryDays = () => {
    if (!expiresAt) return 7;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const expiryDays = calculateExpiryDays();

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Banner */}
      <div className="sticky top-0 z-50 bg-yellow-50 border-b-2 border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Preview Mode</span>
              </div>
              <div className="h-4 w-px bg-yellow-300"></div>
              <div className="flex items-center gap-2 text-yellow-700 text-sm">
                <Clock className="w-4 h-4" />
                <span>This preview link expires in {expiryDays} {expiryDays === 1 ? 'day' : 'days'}</span>
              </div>
            </div>
            <div className="text-sm text-yellow-700">
              Draft Preview • Not indexed by search engines
            </div>
          </div>
        </div>
      </div>

      {/* Sellpage Content */}
      <SectionRenderer
        sections={sellpage.sections || []}
        product={product}
        reviews={reviews || []}
        isPreview={true}
      />
    </div>
  );
}

// Add metadata for SEO (noindex)
export async function generateMetadata({ params }: PreviewPageProps) {
  return {
    title: 'Sellpage Preview',
    robots: {
      index: false,
      follow: false,
    },
  };
}
