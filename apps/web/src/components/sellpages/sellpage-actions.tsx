'use client';

import { useState } from 'react';
import { Copy, ExternalLink, QrCode } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useToast } from '@/components/ui/toast';
import Modal from '@/components/ui/modal';

interface SellpageActionsProps {
  sellpage: {
    id: string;
    name?: string;
    slug: string;
    publicUrl: string;
  };
  variant?: 'default' | 'compact';
  className?: string;
}

export function SellpageActions({
  sellpage,
  variant = 'default',
  className = '',
}: SellpageActionsProps) {
  const [showQR, setShowQR] = useState(false);
  const { success } = useToast();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(sellpage.publicUrl);
      success('Copied!', 'Sellpage URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const openLive = () => {
    window.open(sellpage.publicUrl, '_blank', 'noopener,noreferrer');
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sellpage.slug}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Downloaded!', 'QR code saved to your downloads');
  };

  if (variant === 'compact') {
    return (
      <div className={`flex gap-1 ${className}`}>
        <button
          onClick={copyLink}
          className="rounded p-1.5 text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors"
          title="Copy Link"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={openLive}
          className="rounded p-1.5 text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors"
          title="View Live"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowQR(true)}
          className="rounded p-1.5 text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors"
          title="QR Code"
        >
          <QrCode className="h-4 w-4" />
        </button>

        <QRCodeModal
          open={showQR}
          onClose={() => setShowQR(false)}
          sellpage={sellpage}
          onDownload={downloadQR}
          onCopyLink={copyLink}
        />
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-lg border border-surface-300 px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
      >
        <Copy className="h-4 w-4" />
        Copy Link
      </button>

      <button
        onClick={openLive}
        className="inline-flex items-center gap-2 rounded-lg border border-surface-300 px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        View Live
      </button>

      <button
        onClick={() => setShowQR(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-surface-300 px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
      >
        <QrCode className="h-4 w-4" />
        QR Code
      </button>

      <QRCodeModal
        open={showQR}
        onClose={() => setShowQR(false)}
        sellpage={sellpage}
        onDownload={downloadQR}
        onCopyLink={copyLink}
      />
    </div>
  );
}

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  sellpage: {
    name?: string;
    slug: string;
    publicUrl: string;
  };
  onDownload: () => void;
  onCopyLink: () => void;
}

function QRCodeModal({
  open,
  onClose,
  sellpage,
  onDownload,
  onCopyLink,
}: QRCodeModalProps) {
  if (!open) return null;

  return (
    <Modal isOpen={open} onClose={onClose} title="Sellpage QR Code">
      <div className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center p-6 bg-white rounded-lg border border-surface-200">
          <QRCode
            id="qr-code-canvas"
            value={sellpage.publicUrl}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* URL Display */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-700">Sellpage URL:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={sellpage.publicUrl}
              readOnly
              className="flex-1 rounded-lg border border-surface-300 bg-surface-50 px-3 py-2 text-sm text-surface-600"
            />
            <button
              onClick={onCopyLink}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onDownload}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-surface-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-surface-800 transition-colors"
          >
            <QrCode className="h-4 w-4" />
            Download QR Code
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-surface-300 px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-center text-surface-500">
          Scan this QR code to access your sellpage on mobile devices
        </p>
      </div>
    </Modal>
  );
}
