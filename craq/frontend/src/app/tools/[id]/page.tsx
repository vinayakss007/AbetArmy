'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, ExternalLink, User } from 'lucide-react';
import { Tool, ToolReview } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ToolDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const [tool, setTool] = useState<Tool | null>(null);
  const [reviews, setReviews] = useState<ToolReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTool = async () => {
    try {
      const [toolRes, reviewsRes] = await Promise.all([
        api.get(`/tools/${id}`),
        api.get(`/tools/${id}/reviews`),
      ]);
      setTool(toolRes.data);
      setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : reviewsRes.data.data || []);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTool();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/tools/${id}/reviews`, {
        rating: reviewRating,
        content: reviewContent.trim(),
      });
      toast.success('Review submitted!');
      setReviewContent('');
      setReviewRating(5);
      fetchTool();
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tool not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="card p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tool.name}</h1>
          {tool.url && (
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              Visit <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {tool.description && (
          <p className="mt-4 text-gray-700 dark:text-gray-300">{tool.description}</p>
        )}

        <div className="mt-4 flex items-center gap-4">
          {tool.category && (
            <span className="text-sm font-medium text-brand-600 dark:text-brand-400 capitalize">
              {tool.category}
            </span>
          )}
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {tool.average_rating?.toFixed(1) || 'N/A'}
            </span>
            <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
          </div>
        </div>

        {tool.linked_issue_types && tool.linked_issue_types.length > 0 && (
          <div className="mt-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Helps with: </span>
            <div className="inline-flex flex-wrap gap-1.5 ml-1">
              {tool.linked_issue_types.map((type) => (
                <span key={type} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Reviews ({reviews.length})
        </h2>

        {isAuthenticated && (
          <form onSubmit={handleSubmitReview} className="card p-6 mb-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Write a Review</h3>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= reviewRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              rows={3}
              placeholder="Share your experience with this tool..."
              className="input-field resize-y"
            />

            <button type="submit" disabled={!reviewContent.trim() || isSubmitting} className="btn-primary">
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {review.user?.name || 'User'}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
                {review.content && (
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{review.content}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
