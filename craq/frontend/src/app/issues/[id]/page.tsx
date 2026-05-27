'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { User, Calendar } from 'lucide-react';
import { Issue, Solution } from '@/types';
import VoteButtons from '@/components/common/VoteButtons';
import CommentThread from '@/components/common/CommentThread';
import TagBadge from '@/components/common/TagBadge';
import StatusBadge from '@/components/common/StatusBadge';
import SolutionCard from '@/components/solutions/SolutionCard';
import SolutionForm from '@/components/solutions/SolutionForm';
import AIThreadSummary from '@/components/ai/AIThreadSummary';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function IssueDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthStore();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIssue = async () => {
    try {
      const [issueRes, solutionsRes] = await Promise.all([
        api.get(`/issues/${id}`),
        api.get(`/issues/${id}/solutions`),
      ]);
      setIssue(issueRes.data);
      setSolutions(Array.isArray(solutionsRes.data) ? solutionsRes.data : solutionsRes.data.data || []);
    } catch {
      toast.error('Failed to load issue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const handleAcceptSolution = async (solutionId: string) => {
    try {
      await api.post(`/solutions/${solutionId}/accept`);
      toast.success('Solution accepted!');
      fetchIssue();
    } catch {
      toast.error('Failed to accept solution');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Issue not found</h1>
      </div>
    );
  }

  const isAuthor = user?.id === issue.author_id;
  const sortedSolutions = [...solutions].sort((a, b) => {
    if (a.is_accepted) return -1;
    if (b.is_accepted) return 1;
    return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="card p-6 sm:p-8">
        <div className="flex gap-4">
          <div className="hidden sm:block">
            <VoteButtons
              targetType="issue"
              targetId={issue.id}
              upvotes={issue.upvotes}
              downvotes={issue.downvotes}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex-1">
                {issue.title}
              </h1>
              <StatusBadge status={issue.status} />
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{issue.author?.name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {issue.category && <TagBadge tag={issue.category} variant="category" />}
              {issue.industry && <TagBadge tag={issue.industry} variant="industry" />}
              {issue.stage && <TagBadge tag={issue.stage} variant="stage" />}
              {issue.tags?.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>

            <div className="mt-6 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {issue.description}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <CommentThread parentType="issue" parentId={issue.id} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Solutions ({solutions.length})
          </h2>
          <AIThreadSummary issueId={issue.id} />
        </div>

        <div className="space-y-4">
          {sortedSolutions.map((solution) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
              issueAuthorId={isAuthor ? user?.id : undefined}
              onAccept={isAuthor ? handleAcceptSolution : undefined}
            />
          ))}
        </div>

        {user && (
          <div className="mt-6">
            <SolutionForm issueId={issue.id} onSolutionAdded={fetchIssue} />
          </div>
        )}
      </div>
    </div>
  );
}
