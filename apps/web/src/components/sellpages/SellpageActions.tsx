'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Copy,
  ExternalLink,
  QrCode,
  LinkIcon,
  Check,
  Link2,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import QRCode from 'qrcode';

interface SellpageActionsProps {
  sellpageId: string;
  slug: string;
  storeSlug?: string;
  storeDomain?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export function SellpageActions({
  sellpageId,
  slug,
  storeSlug,
  storeDomain,
  status,
}: SellpageActionsProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUtm, setCopiedUtm] = useState(false);

  // Generate the sellpage URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const sellpageUrl = storeDomain
    ? `https://${storeDomain}/${slug}`
    : storeSlug
    ? `${baseUrl}/${storeSlug}/${slug}`
    : `${baseUrl}/preview/${sellpageId}`;

  // Generate UTM link (example with common params)
  const utmLink = `${sellpageUrl}?utm_source=marketing&utm_medium=email&utm_campaign=launch`;

  const copyToClipboard = async (text: string, type: 'link' | 'utm') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedUtm(true);
        setTimeout(() => setCopiedUtm(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(sellpageUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
      setShowQRModal(true);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${slug}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(sellpageUrl, '_blank');
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Copy Link Button */}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          onClick={() => copyToClipboard(sellpageUrl, 'link')}
        >
          {copiedLink ? 'Copied!' : 'Copy Link'}
        </Button>

        {/* View Button (only for published) */}
        {status === 'PUBLISHED' && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ExternalLink className="h-4 w-4" />}
            onClick={openInNewTab}
          >
            View
          </Button>
        )}

        {/* QR Code Button */}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<QrCode className="h-4 w-4" />}
          onClick={generateQRCode}
        >
          QR Code
        </Button>

        {/* UTM Link Button */}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={copiedUtm ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          onClick={() => copyToClipboard(utmLink, 'utm')}
        >
          {copiedUtm ? 'Copied!' : 'UTM Link'}
        </Button>
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="QR Code"
      >
        <div className="space-y-4">
          <div className="flex justify-center rounded-lg bg-white p-6">
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="h-[400px] w-[400px]"
              />
            )}
          </div>

          <div className="rounded-lg bg-surface-50 p-4 dark:bg-surface-800">
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400">
              Scan this QR code to visit:
            </p>
            <p className="mt-1 break-all text-sm font-medium text-surface-900 dark:text-surface-100">
              {sellpageUrl}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              leftIcon={<Copy className="h-4 w-4" />}
              onClick={() => copyToClipboard(sellpageUrl, 'link')}
            >
              Copy Link
            </Button>
            <Button
              className="flex-1"
              onClick={downloadQRCode}
            >
              Download QR Code
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
