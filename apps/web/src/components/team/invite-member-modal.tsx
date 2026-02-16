'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const ROLE_OPTIONS = [
  { value: 'VIEWER', label: 'Viewer' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'ADMIN', label: 'Admin' },
];

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workspaceId?: string;
}

export function InviteMemberModal({
  open,
  onClose,
  onSuccess,
  workspaceId,
}: InviteMemberModalProps) {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    role: 'EDITOR',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspaceId) {
      error('Workspace ID is required');
      return;
    }

    setLoading(true);

    try {
      // First, check if user exists
      const userResponse = await apiClient.get(`/users/by-email/${formData.email}`);

      if (!userResponse) {
        error('User not found. They must create an account first.');
        return;
      }

      // Add user to workspace
      await apiClient.post(`/workspaces/${workspaceId}/members`, {
        userId: userResponse.id,
        role: formData.role,
      });

      success('Member invited successfully');
      setFormData({ email: '', role: 'EDITOR' });
      onSuccess();
    } catch (err: any) {
      if (err.message?.includes('already a member')) {
        error('This user is already a member of this workspace');
      } else {
        error(err.message || 'Failed to invite member');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Invite Team Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-surface-900 dark:text-surface-100">
            Email Address
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="colleague@example.com"
            required
          />
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            User must already have an account
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-surface-900 dark:text-surface-100">
            Role
          </label>
          <Select
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value })}
            options={ROLE_OPTIONS}
          />
          <div className="mt-2 space-y-1">
            <p className="text-xs text-surface-600 dark:text-surface-400">
              <strong>Viewer:</strong> Can view all data but cannot make changes
            </p>
            <p className="text-xs text-surface-600 dark:text-surface-400">
              <strong>Editor:</strong> Can create and edit content
            </p>
            <p className="text-xs text-surface-600 dark:text-surface-400">
              <strong>Admin:</strong> Can manage settings and team members
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Inviting...' : 'Send Invite'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
