'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500).optional(),
  industry: z.string().optional(),
  stage: z.string().optional(),
  skills: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const industries = ['SaaS', 'E-commerce', 'Healthcare', 'FinTech', 'EdTech', 'Marketplace', 'Agency', 'Other'];
const stages = ['Idea', 'MVP', 'Early Revenue', 'Growth', 'Scale', 'Mature'];

export default function EditProfilePage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('bio', user.bio || '');
      setValue('industry', user.industry || '');
      setValue('stage', user.stage || '');
      setValue('skills', user.skills?.join(', ') || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    try {
      await api.put(`/users/${user.id}`, {
        ...data,
        skills: data.skills
          ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      });
      toast.success('Profile updated!');
      await checkAuth();
      router.push(`/profile/${user.id}`);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input type="text" {...register('name')} className="input-field" />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea {...register('bio')} rows={4} className="input-field resize-y" placeholder="Tell us about yourself..." />
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
              Skills
            </label>
            <input
              type="text"
              {...register('skills')}
              className="input-field"
              placeholder="Comma-separated (e.g., marketing, product, sales)"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
