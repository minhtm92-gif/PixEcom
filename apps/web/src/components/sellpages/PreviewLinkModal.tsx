'use client';

import { useState } from 'react';
import { Copy, ExternalLink, X, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface PreviewToken {
  id: string;
  expiresAt: string;
  createdAt: string;
  creator?: {
    id: string;
    email: string;
    displayName: string;
  };
}

interface PreviewLinkModalProps {
  sellpageId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewLinkModal({ sellpageId, isOpen, onClose }: PreviewLinkModalProps) {
  const [tokens, setTokens] = useState<PreviewToken[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<{
    token: string;
    expiresAt: string;
    previewUrl: string;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const generatePreviewLink = async () => {
    setIsGenerating(true);
    try {
      // Call actual API to generate preview token
      const response = await apiClient.post<{ token: string; expiresAt: string }>(
        `/sellpages/${sellpageId}/preview-token`
      );

      const previewUrl = getPreviewUrl(response.token);

      setGeneratedToken({
        token: response.token,
        expiresAt: response.expiresAt,
        previewUrl,
      });
    } catch (error) {
      console.error('Failed to generate preview link:', error);
      alert('Failed to generate preview link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, tokenId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(tokenId);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return 'Expires in 1 day';
    return `Expires in ${diffDays} days`;
  };

  const getPreviewUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/preview/${token}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Preview Links</h2>
            <p className="text-sm text-gray-600 mt-1">
              Share draft versions of your sellpage securely
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Generated Token Display */}
          {generatedToken && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                <Clock className="w-4 h-4" />
                Preview Link Generated!
              </div>
              <p className="text-sm text-green-700 mb-3">
                This link will expire in 7 days. Copy it to share your draft sellpage.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getPreviewUrl(generatedToken.token)}
                  className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(getPreviewUrl(generatedToken.token), 'new')}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copiedToken === 'new' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="mb-6">
            <button
              onClick={generatePreviewLink}
              disabled={isGenerating}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Generate New Preview Link
                </>
              )}
            </button>
          </div>

          {/* Active Tokens List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Active Preview Links</h3>
            {tokens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No active preview links</p>
                <p className="text-xs text-gray-400 mt-1">
                  Generate a link to share your draft sellpage
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900 font-medium">
                        Preview Link
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(token.expiresAt)}
                        {token.creator && ` • Created by ${token.creator.displayName}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => copyToClipboard(getPreviewUrl(token.id), token.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">About Preview Links</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Preview links allow anyone with the URL to view your draft sellpage</li>
              <li>• Links expire after 7 days for security</li>
              <li>• Preview pages are not indexed by search engines</li>
              <li>• Perfect for sharing with team members or clients for feedback</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
