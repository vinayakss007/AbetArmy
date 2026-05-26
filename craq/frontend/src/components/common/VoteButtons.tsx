'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

interface VoteButtonsProps {
  targetType: 'issue' | 'solution';
  targetId: string;
  upvotes: number;
  downvotes: number;
  userVote?: number;
}

export default function VoteButtons({
  targetType,
  targetId,
  upvotes,
  downvotes,
  userVote: initialUserVote = 0,
}: VoteButtonsProps) {
  const { isAuthenticated } = useAuthStore();
  const [currentVote, setCurrentVote] = useState(initialUserVote);
  const [votes, setVotes] = useState({ up: upvotes, down: downvotes });

  const handleVote = async (value: number) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to vote');
      return;
    }

    const newValue = currentVote === value ? 0 : value;

    try {
      await api.post('/votes', { targetType, targetId, value: newValue });

      setVotes((prev) => {
        const updated = { ...prev };
        if (currentVote === 1) updated.up--;
        if (currentVote === -1) updated.down--;
        if (newValue === 1) updated.up++;
        if (newValue === -1) updated.down++;
        return updated;
      });
      setCurrentVote(newValue);
    } catch {
      toast.error('Failed to vote');
    }
  };

  const score = votes.up - votes.down;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleVote(1)}
        className={`p-1 rounded transition-colors ${
          currentVote === 1
            ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/30'
            : 'text-gray-400 hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Upvote"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <span
        className={`text-sm font-semibold ${
          score > 0
            ? 'text-brand-600 dark:text-brand-400'
            : score < 0
            ? 'text-red-500'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {score}
      </span>

      <button
        onClick={() => handleVote(-1)}
        className={`p-1 rounded transition-colors ${
          currentVote === -1
            ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
            : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Downvote"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}
