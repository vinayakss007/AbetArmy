'use client';

import { useState } from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { Issue } from '@/types';

interface AISuggestionsProps {
  title: string;
  description: string;
}

export default function AISuggestions({ title, description }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchSuggestions = async () => {
    if (!title.trim() || title.length < 10) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await api.post('/ai/similar-issues', { title, description });
      setSuggestions(response.data.issues || []);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasSearched && !isLoading) {
    return (
      <button
        onClick={fetchSuggestions}
        disabled={!title.trim() || title.length < 10}
        className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 disabled:no-underline"
      >
        <Sparkles className="h-4 w-4" />
        Find similar solved issues
      </button>
    );
  }

  return (
    <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
          Similar Issues (AI-Powered)
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600" />
          Searching for similar issues...
        </div>
      ) : suggestions.length > 0 ? (
        <ul className="space-y-2">
          {suggestions.map((issue) => (
            <li key={issue.id}>
              <Link
                href={`/issues/${issue.id}`}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400"
              >
                <ExternalLink className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  <span className="font-medium">{issue.title}</span>
                  {issue.status === 'solved' && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Solved)</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No similar issues found. Your question appears to be unique!</p>
      )}
    </div>
  );
}
