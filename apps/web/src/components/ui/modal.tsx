'use client';

import React, { useEffect, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 animate-fade-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative z-10 w-full rounded-xl bg-white shadow-xl animate-slide-up',
          'max-h-[90vh] overflow-y-auto',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-lg',
          size === 'lg' && 'max-w-2xl',
          size === 'xl' && 'max-w-4xl'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || description) && (
          <div className="border-b border-surface-200 px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                {title && (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-surface-900"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-surface-500">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-4 rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 border-t border-surface-200 px-6 py-4',
        className
      )}
    >
      {children}
    </div>
  );
}

export { Modal, ModalFooter };
