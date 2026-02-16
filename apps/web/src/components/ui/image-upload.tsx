'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
  helpText?: string;
  dimensions?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
  maxSize = 2 * 1024 * 1024, // 2MB default
  helpText,
  dimensions,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
      return;
    }

    // Validate file type
    if (!accept.split(',').some((type) => file.type === type.trim())) {
      setError('Invalid file type. Please upload an image.');
      return;
    }

    setUploading(true);

    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to your backend
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
        {label}
      </label>

      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="flex-shrink-0">
          {value ? (
            <div className="relative group">
              <img
                src={value}
                alt={label}
                className="h-24 w-24 rounded-lg border border-surface-200 dark:border-surface-700 object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800">
              <ImageIcon className="h-8 w-8 text-surface-400" />
            </div>
          )}
        </div>

        {/* Upload button */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            {uploading ? 'Uploading...' : value ? 'Change Image' : 'Upload Image'}
          </Button>

          {(helpText || dimensions) && (
            <div className="space-y-1">
              {dimensions && (
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  Recommended: {dimensions}
                </p>
              )}
              {helpText && (
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  {helpText}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
