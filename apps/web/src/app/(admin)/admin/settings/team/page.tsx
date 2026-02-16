'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { UserPlus, Trash2, Users as UsersIcon } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InviteMemberModal } from '@/components/team/invite-member-modal';

interface Member {
  id: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
}

const ROLE_OPTIONS = [
  { value: 'VIEWER', label: 'Viewer' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'OWNER', label: 'Owner' },
];

export default function TeamManagementPage() {
  const { workspace } = useAuthStore();
  const { success, error } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  useEffect(() => {
    if (workspace?.id) {
      loadMembers();
    }
  }, [workspace?.id]);

  const loadMembers = async () => {
    try {
      const data = await apiClient.get(`/workspaces/${workspace.id}/members`);
      setMembers(data);
    } catch (err) {
      error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await apiClient.patch(`/workspaces/${workspace.id}/members/${memberId}`, {
        role: newRole,
      });
      success('Role updated successfully');
      loadMembers();
    } catch (err: any) {
      error(err.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await apiClient.delete(
        `/workspaces/${workspace.id}/members/${memberToRemove.id}`
      );
      success('Member removed successfully');
      setMemberToRemove(null);
      loadMembers();
    } catch (err: any) {
      error(err.message || 'Failed to remove member');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const ownerCount = members.filter((m) => m.role === 'OWNER').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-surface-500">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Team Members
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            Manage who has access to this workspace
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
          <UsersIcon className="h-12 w-12 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
            No team members yet
          </h3>
          <p className="text-surface-600 dark:text-surface-400 mb-4">
            Invite your first team member to collaborate
          </p>
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {members.map((member) => {
                const isLastOwner = member.role === 'OWNER' && ownerCount === 1;

                return (
                  <tr
                    key={member.id}
                    className="hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-sm font-medium text-brand-700 dark:text-brand-300">
                          {member.user.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="text-sm font-medium text-surface-900 dark:text-surface-100">
                          {member.user.displayName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600 dark:text-surface-400">
                      {member.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={member.role}
                        onChange={(value) => handleRoleChange(member.id, value)}
                        options={ROLE_OPTIONS}
                        disabled={isLastOwner}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={member.isActive ? 'success' : 'secondary'}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600 dark:text-surface-400">
                      {formatDate(member.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setMemberToRemove(member)}
                        disabled={isLastOwner}
                        title={
                          isLastOwner
                            ? 'Cannot remove last owner'
                            : 'Remove member'
                        }
                      >
                        <Trash2
                          className={`h-4 w-4 ${isLastOwner ? 'text-surface-300' : 'text-red-600'}`}
                        />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      <InviteMemberModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          setShowInviteModal(false);
          loadMembers();
        }}
        workspaceId={workspace?.id}
      />

      {/* Remove Confirmation */}
      <ConfirmDialog
        open={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${memberToRemove?.user?.displayName}? They will lose access to this workspace.`}
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}
