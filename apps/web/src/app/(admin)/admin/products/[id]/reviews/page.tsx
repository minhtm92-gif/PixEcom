'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Star, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Review {
  id: string;
  authorName: string;
  avatarUrl: string | null;
  rating: number;
  body: string;
  isVisible: boolean;
  createdAtOverride: string | null;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    email: string;
    displayName: string;
  };
}

export default function ProductReviewsPage() {
  const params = useParams();
  const productId = params.id as string;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    authorName: '',
    avatarUrl: '',
    rating: 5,
    body: '',
    isVisible: true,
  });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  async function loadReviews() {
    try {
      const response = await apiClient.get<Review[]>(`/products/${productId}/reviews`);
      setReviews(response || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingReview) {
        await apiClient.patch(`/products/${productId}/reviews/${editingReview.id}`, formData);
      } else {
        await apiClient.post(`/products/${productId}/reviews`, formData);
      }

      // Reset form
      setFormData({
        authorName: '',
        avatarUrl: '',
        rating: 5,
        body: '',
        isVisible: true,
      });
      setIsCreateModalOpen(false);
      setEditingReview(null);
      await loadReviews();
    } catch (error) {
      console.error('Failed to save review:', error);
      alert('Failed to save review. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await apiClient.delete(`/products/${productId}/reviews/${reviewId}`);
      await loadReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Failed to delete review. Check console for details.');
    }
  }

  async function handleToggleVisibility(review: Review) {
    try {
      await apiClient.patch(`/products/${productId}/reviews/${review.id}`, {
        isVisible: !review.isVisible,
      });
      await loadReviews();
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      alert('Failed to toggle visibility. Check console for details.');
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage admin-created reviews for this product
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
        >
          <Plus className="w-4 h-4" />
          Create Review
        </button>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Create your first review to get started
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {review.avatarUrl ? (
                        <img
                          src={review.avatarUrl}
                          alt={review.authorName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {review.authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {review.authorName}
                        </div>
                        <div className="text-xs text-gray-500">
                          by {review.creator.displayName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStars(review.rating)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2 max-w-md">
                      {review.body}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(review.createdAtOverride || review.createdAt)}
                    </div>
                    {review.createdAtOverride && (
                      <div className="text-xs text-gray-500">Backdated</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleVisibility(review)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        review.isVisible
                          ? 'text-green-700 bg-green-100'
                          : 'text-gray-700 bg-gray-100'
                      }`}
                    >
                      {review.isVisible ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Hidden
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingReview(review)}
                        className="text-brand-600 hover:text-brand-700"
                        title="Edit review"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Review Modal */}
      {(isCreateModalOpen || editingReview) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingReview ? 'Edit Review' : 'Create Review'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 self-center">
                    {formData.rating} {formData.rating === 1 ? 'star' : 'stars'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Great product! Highly recommend..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isVisible" className="text-sm text-gray-700">
                  Visible on public site
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      authorName: '',
                      avatarUrl: '',
                      rating: 5,
                      body: '',
                      isVisible: true,
                    });
                    setIsCreateModalOpen(false);
                    setEditingReview(null);
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingReview ? 'Update' : 'Create'} Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
