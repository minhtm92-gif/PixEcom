'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal } from './modal';
import { Button } from './button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={open} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center">
        <div
          className={
            variant === 'danger'
              ? 'mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'
              : 'mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100'
          }
        >
          <AlertTriangle
            className={
              variant === 'danger' ? 'h-6 w-6 text-red-600' : 'h-6 w-6 text-yellow-600'
            }
          />
        </div>
        <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
        <p className="mt-2 text-sm text-surface-500">{message}</p>
        <div className="mt-6 flex gap-3 w-full">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="flex-1"
            isLoading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
