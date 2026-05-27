import { CheckCircle, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isSolved = status === 'solved';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
        isSolved
          ? 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400 border border-success-200 dark:border-success-800/50'
          : 'bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400 border border-warning-200 dark:border-warning-800/50 animate-pulse-glow'
      }`}
    >
      {isSolved ? (
        <CheckCircle className="h-3.5 w-3.5" />
      ) : (
        <Circle className="h-3 w-3 animate-breathe" />
      )}
      {isSolved ? 'Solved' : 'Open'}
    </span>
  );
}
