'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import ImageUpload from '@/components/common/ImageUpload';
import AISolutionDraft from '@/components/ai/AISolutionDraft';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface SolutionFormProps {
  issueId: string;
  onSolutionAdded: () => void;
}

export default function SolutionForm({ issueId, onSolutionAdded }: SolutionFormProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/issues/${issueId}/solutions`, {
        content: content.trim(),
        images,
      });
      setContent('');
      setImages([]);
      toast.success('Solution posted!');
      onSolutionAdded();
    } catch {
      toast.error('Failed to post solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Your Solution
      </h3>

      <AISolutionDraft issueId={issueId} onUseDraft={(draft) => setContent(draft)} />

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your solution or insight..."
          rows={6}
          className="input-field resize-y"
        />

        <ImageUpload
          onUpload={(url) => setImages((prev) => [...prev, url])}
          existingImages={images}
          onRemove={(url) => setImages((prev) => prev.filter((i) => i !== url))}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Posting...' : 'Post Solution'}
          </button>
        </div>
      </form>
    </div>
  );
}
