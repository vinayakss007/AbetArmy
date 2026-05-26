'use client';

import { useState } from 'react';
import { Sparkles, ListChecks } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AIThreadSummaryProps {
  issueId: string;
}

export default function AIThreadSummary({ issueId }: AIThreadSummaryProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/ai/summarize', { issueId });
      setSummary(response.data.summary || '');
    } catch {
      toast.error('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  if (!summary) {
    return (
      <button
        onClick={generateSummary}
        disabled={isLoading}
        className="flex items-center gap-2 text-sm btn-secondary"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600" />
            Summarizing...
          </>
        ) : (
          <>
            <ListChecks className="h-4 w-4" />
            AI Summarize Thread
          </>
        )}
      </button>
    );
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          AI Summary - Key Actionable Steps
        </span>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {summary}
      </div>
    </div>
  );
}
