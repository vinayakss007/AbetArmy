'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AISolutionDraftProps {
  issueId: string;
  onUseDraft: (draft: string) => void;
}

export default function AISolutionDraft({ issueId, onUseDraft }: AISolutionDraftProps) {
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDraft = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/ai/solution-draft', { issueId });
      setDraft(response.data.draft || '');
    } catch {
      toast.error('Failed to generate AI draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!draft) {
    return (
      <button
        onClick={generateDraft}
        disabled={isLoading}
        className="flex items-center gap-2 text-sm btn-secondary"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            AI Generate Draft
          </>
        )}
      </button>
    );
  }

  return (
    <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
            AI-Generated Draft
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">
        {draft}
      </div>

      <div className="flex gap-2">
        <button onClick={() => onUseDraft(draft)} className="btn-primary text-sm">
          Use This Draft
        </button>
        <button onClick={generateDraft} className="btn-ghost text-sm">
          Regenerate
        </button>
      </div>
    </div>
  );
}
