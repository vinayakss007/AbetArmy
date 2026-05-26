import Link from 'next/link';
import { MessageSquare, User } from 'lucide-react';
import { Issue } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import TagBadge from '@/components/common/TagBadge';
import VoteButtons from '@/components/common/VoteButtons';
import { formatDistanceToNow } from 'date-fns';

interface IssueCardProps {
  issue: Issue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  return (
    <div className="card p-4 sm:p-6 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
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
          <div className="flex items-start justify-between gap-2">
            <Link href={`/issues/${issue.id}`} className="group">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 line-clamp-2">
                {issue.title}
              </h3>
            </Link>
            <StatusBadge status={issue.status} />
          </div>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {issue.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {issue.category && <TagBadge tag={issue.category} variant="category" />}
            {issue.tags?.slice(0, 3).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{issue.author?.name || 'Anonymous'}</span>
              </div>
              <span>{formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1 sm:hidden">
                <span className="font-medium">{issue.upvotes - issue.downvotes}</span>
                <span>votes</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{issue.solution_count || 0} solutions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
