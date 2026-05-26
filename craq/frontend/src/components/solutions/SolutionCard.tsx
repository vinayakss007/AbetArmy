import { CheckCircle, User } from 'lucide-react';
import { Solution } from '@/types';
import VoteButtons from '@/components/common/VoteButtons';
import CommentThread from '@/components/common/CommentThread';
import { formatDistanceToNow } from 'date-fns';

interface SolutionCardProps {
  solution: Solution;
  issueAuthorId?: string;
  onAccept?: (solutionId: string) => void;
}

export default function SolutionCard({ solution, issueAuthorId, onAccept }: SolutionCardProps) {
  return (
    <div
      className={`card p-4 sm:p-6 ${
        solution.is_accepted
          ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
          : ''
      }`}
    >
      <div className="flex gap-4">
        <VoteButtons
          targetType="solution"
          targetId={solution.id}
          upvotes={solution.upvotes}
          downvotes={solution.downvotes}
        />

        <div className="flex-1 min-w-0">
          {solution.is_accepted && (
            <div className="flex items-center gap-1 mb-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Accepted Solution</span>
            </div>
          )}

          <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
            {solution.content}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <User className="h-3.5 w-3.5" />
              <span>{solution.author?.name || 'Anonymous'}</span>
              <span>{formatDistanceToNow(new Date(solution.created_at), { addSuffix: true })}</span>
            </div>

            {!solution.is_accepted && issueAuthorId && onAccept && (
              <button
                onClick={() => onAccept(solution.id)}
                className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Accept
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <CommentThread parentType="solution" parentId={solution.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
