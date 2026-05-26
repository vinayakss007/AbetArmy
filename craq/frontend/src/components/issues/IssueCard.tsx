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
    <div className="card group relative overflow-hidden p-4 sm:p-6 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/5 dark:hover:shadow-brand-400/5 hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300">
      {/* Left gradient accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-accent-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
            <Link href={`/issues/${issue.id}`} className="group/link">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover/link:text-brand-600 dark:group-hover/link:text-brand-400 line-clamp-2 transition-colors duration-300">
                {issue.title}
              </h3>
            </Link>
            <StatusBadge status={issue.status} />
          </div>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
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
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-300 to-accent-300 dark:from-brand-600 dark:to-accent-600 flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium">{issue.author?.name || 'Anonymous'}</span>
              </div>
              <span className="text-gray-400 dark:text-gray-500">
                {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1 sm:hidden">
                <span className="font-medium">{issue.upvotes - issue.downvotes}</span>
                <span>votes</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="font-medium">{issue.solution_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
