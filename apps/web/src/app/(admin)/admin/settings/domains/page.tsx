'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Clock, Trash2, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Store {
  id: string;
  name: string;
  slug: string;
}

interface Domain {
  id: string;
  hostname: string;
  verificationMethod: 'TXT' | 'A_RECORD';
  verificationToken: string;
  expectedARecordIp: string | null;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  isPrimary: boolean;
  isActive: boolean;
  lastCheckedAt: string | null;
  verifiedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export default function DomainsPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [newDomain, setNewDomain] = useState({ hostname: '', verificationMethod: 'TXT' as 'TXT' | 'A_RECORD' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      loadDomains(selectedStoreId);
    }
  }, [selectedStoreId]);

  async function loadStores() {
    try {
      const response = await apiClient.get<{ data: Store[] }>('/stores');
      setStores(response.data || []);
      // Auto-select first store if available
      if (response.data && response.data.length > 0) {
        setSelectedStoreId(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDomains(storeId: string) {
    try {
      setIsLoading(true);
      const response = await apiClient.get<Domain[]>(`/stores/${storeId}/domains`);
      setDomains(response || []);
    } catch (error) {
      console.error('Failed to load domains:', error);
      setDomains([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyDomain(domainId: string) {
    if (!selectedStoreId) {
      alert('Please select a store first');
      return;
    }

    try {
      await apiClient.post(`/stores/${selectedStoreId}/domains/${domainId}/verify`, {});
      await loadDomains(selectedStoreId);
    } catch (error) {
      console.error('Failed to verify domain:', error);
      alert('Failed to verify domain. Check console for details.');
    }
  }

  async function handleSetPrimary(domainId: string) {
    if (!selectedStoreId) {
      alert('Please select a store first');
      return;
    }

    try {
      await apiClient.patch(`/stores/${selectedStoreId}/domains/${domainId}`, { isPrimary: true });
      await loadDomains(selectedStoreId);
    } catch (error) {
      console.error('Failed to set primary domain:', error);
      alert('Failed to set primary domain. Check console for details.');
    }
  }

  async function handleDeleteDomain(domainId: string) {
    if (!selectedStoreId) {
      alert('Please select a store first');
      return;
    }

    if (!confirm('Are you sure you want to delete this domain?')) return;

    try {
      await apiClient.delete(`/stores/${selectedStoreId}/domains/${domainId}`);
      await loadDomains(selectedStoreId);
    } catch (error) {
      console.error('Failed to delete domain:', error);
      alert('Failed to delete domain. Check console for details.');
    }
  }

  const getStatusBadge = (status: Domain['status']) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Verified
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Domains</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage custom domains for your stores
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={!selectedStoreId}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Domain
        </button>
      </div>

      {/* Store Selector */}
      <div className="mb-6">
        <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-2">
          Select Store
        </label>
        <select
          id="store"
          value={selectedStoreId}
          onChange={(e) => setSelectedStoreId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Choose a store...</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      {/* Domains Table */}
      {selectedStoreId && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading domains...</div>
          ) : domains.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No domains configured yet. Add your first domain to get started.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Primary
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {domains.map((domain) => (
                  <tr key={domain.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{domain.hostname}</div>
                      {domain.failureReason && (
                        <div className="text-xs text-red-600 mt-1">{domain.failureReason}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {domain.verificationMethod === 'TXT' ? 'TXT Record' : 'A Record'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(domain.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {domain.isPrimary ? (
                        <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                          Primary
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetPrimary(domain.id)}
                          disabled={domain.status !== 'VERIFIED'}
                          className="text-sm text-brand-600 hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Set Primary
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {domain.status === 'PENDING' && (
                          <button
                            onClick={() => handleVerifyDomain(domain.id)}
                            className="text-brand-600 hover:text-brand-700"
                            title="Check verification"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedDomain(domain)}
                          className="text-gray-600 hover:text-gray-700"
                          title="View details"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteDomain(domain.id)}
                          disabled={!selectedStoreId}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete domain"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Domain Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Add Custom Domain</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              try {
                await apiClient.post(`/stores/${selectedStoreId}/domains`, newDomain);
                setIsAddModalOpen(false);
                setNewDomain({ hostname: '', verificationMethod: 'TXT' });
                await loadDomains(selectedStoreId);
              } catch (error) {
                console.error('Failed to add domain:', error);
                alert('Failed to add domain. Check console for details.');
              } finally {
                setIsSubmitting(false);
              }
            }}>
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="hostname" className="block text-sm font-medium text-gray-700 mb-1">
                    Domain Name
                  </label>
                  <input
                    type="text"
                    id="hostname"
                    value={newDomain.hostname}
                    onChange={(e) => setNewDomain({ ...newDomain, hostname: e.target.value })}
                    placeholder="example.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Method
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="method"
                        value="TXT"
                        checked={newDomain.verificationMethod === 'TXT'}
                        onChange={(e) => setNewDomain({ ...newDomain, verificationMethod: 'TXT' })}
                        className="mr-2"
                      />
                      <span className="text-sm">TXT Record (Recommended)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="method"
                        value="A_RECORD"
                        checked={newDomain.verificationMethod === 'A_RECORD'}
                        onChange={(e) => setNewDomain({ ...newDomain, verificationMethod: 'A_RECORD' })}
                        className="mr-2"
                      />
                      <span className="text-sm">A Record</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewDomain({ hostname: '', verificationMethod: 'TXT' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Domain Details Modal - Placeholder */}
      {selectedDomain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Domain Verification Instructions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Domain</h3>
                <p className="text-sm text-gray-900">{selectedDomain.hostname}</p>
              </div>
              {selectedDomain.verificationMethod === 'TXT' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Add TXT Record</h3>
                  <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
                    pixecom-verify={selectedDomain.verificationToken}
                  </div>
                </div>
              )}
              {selectedDomain.verificationMethod === 'A_RECORD' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Point A Record To</h3>
                  <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
                    {selectedDomain.expectedARecordIp}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedDomain(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  if (selectedDomain) {
                    await handleVerifyDomain(selectedDomain.id);
                    // Refresh the selected domain data
                    const refreshedDomains = await apiClient.get<Domain[]>(`/stores/${selectedStoreId}/domains`);
                    const refreshedDomain = refreshedDomains.find(d => d.id === selectedDomain.id);
                    if (refreshedDomain) {
                      setSelectedDomain(refreshedDomain);
                    }
                  }
                }}
                disabled={!selectedStoreId}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
