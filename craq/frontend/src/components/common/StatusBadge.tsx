import { CheckCircle, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isSolved = status === 'solved';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isSolved
          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      }`}
    >
      {isSolved ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
      {isSolved ? 'Solved' : 'Open'}
    </span>
  );
}
