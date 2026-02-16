'use client';

import { FacebookPixel } from './FacebookPixel';
import { TikTokPixel } from './TikTokPixel';
import { GoogleAnalytics } from './GoogleAnalytics';
import { GoogleTagManager } from './GoogleTagManager';

interface TrackingProviderProps {
  facebookPixelId?: string;
  tiktokPixelId?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
}

export function TrackingProvider({
  facebookPixelId,
  tiktokPixelId,
  googleAnalyticsId,
  googleTagManagerId,
}: TrackingProviderProps) {
  return (
    <>
      {facebookPixelId && <FacebookPixel pixelId={facebookPixelId} />}
      {tiktokPixelId && <TikTokPixel pixelId={tiktokPixelId} />}
      {googleAnalyticsId && <GoogleAnalytics measurementId={googleAnalyticsId} />}
      {googleTagManagerId && <GoogleTagManager containerId={googleTagManagerId} />}
    </>
  );
}
