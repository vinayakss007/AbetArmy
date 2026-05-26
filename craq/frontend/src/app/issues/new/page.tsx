'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ImageUpload from '@/components/common/ImageUpload';
import AISuggestions from '@/components/ai/AISuggestions';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const issueSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(20, 'Please provide more details (at least 20 characters)'),
  category: z.string().optional(),
  industry: z.string().optional(),
  stage: z.string().optional(),
  type: z.string().optional(),
});

type IssueForm = z.infer<typeof issueSchema>;

const categories = ['Marketing', 'Finance', 'Operations', 'Sales', 'Product', 'HR', 'Legal', 'Technology'];
const industries = ['SaaS', 'E-commerce', 'Healthcare', 'FinTech', 'EdTech', 'Marketplace', 'Agency', 'Other'];
const stages = ['Idea', 'MVP', 'Early Revenue', 'Growth', 'Scale', 'Mature'];
const types = ['Strategy', 'Technical', 'Financial', 'Legal', 'Hiring', 'Marketing', 'Other'];

export default function NewIssuePage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IssueForm>({
    resolver: zodResolver(issueSchema),
  });

  const title = watch('title') || '';
  const description = watch('description') || '';

  const onSubmit = async (data: IssueForm) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/issues', {
        ...data,
        images,
        tags,
      });
      toast.success('Issue posted!');
      router.push(`/issues/${response.data.id}`);
    } catch {
      toast.error('Failed to post issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags((prev) => [...prev, tag]);
      setTagInput('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Post a New Issue
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              {...register('title')}
              className="input-field"
              placeholder="What business challenge are you facing?"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={8}
              className="input-field resize-y"
              placeholder="Describe your issue in detail. Include context, what you have tried, and what outcome you are looking for."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {title.length >= 10 && (
            <AISuggestions title={title} description={description} />
          )}

          <ImageUpload
            onUpload={(url) => setImages((prev) => [...prev, url])}
            existingImages={images}
            onRemove={(url) => setImages((prev) => prev.filter((i) => i !== url))}
          />
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Categorization</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select {...register('category')} className="input-field">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c.toLowerCase()}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Industry
              </label>
              <select {...register('industry')} className="input-field">
                <option value="">Select industry</option>
                {industries.map((i) => (
                  <option key={i} value={i.toLowerCase()}>{i}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Stage
              </label>
              <select {...register('stage')} className="input-field">
                <option value="">Select stage</option>
                {stages.map((s) => (
                  <option key={s} value={s.toLowerCase()}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select {...register('type')} className="input-field">
                <option value="">Select type</option>
                {types.map((t) => (
                  <option key={t} value={t.toLowerCase()}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (up to 5)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="input-field flex-1"
                placeholder="Add a tag and press Enter"
              />
              <button type="button" onClick={addTag} className="btn-secondary">
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                      className="text-gray-500 hover:text-red-500"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Posting...' : 'Post Issue'}
          </button>
        </div>
      </form>
    </div>
  );
}
