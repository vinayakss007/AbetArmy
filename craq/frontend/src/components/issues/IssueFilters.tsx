'use client';

interface IssueFiltersProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { value: 'trending', label: 'Trending' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'unsolved', label: 'Unsolved' },
  { value: 'most_votes', label: 'Most Votes' },
];

export default function IssueFilters({ sortBy, onSortChange }: IssueFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
      <div className="flex gap-1">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              sortBy === option.value
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
