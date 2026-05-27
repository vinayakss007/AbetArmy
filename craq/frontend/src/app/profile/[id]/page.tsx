'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { User as UserIcon, Calendar, Award, Briefcase, MapPin } from 'lucide-react';
import { User, Issue, Solution } from '@/types';
import IssueCard from '@/components/issues/IssueCard';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

type TabType = 'issues' | 'solutions' | 'accepted';

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('issues');
  const [activity, setActivity] = useState<{ issues: Issue[]; solutions: Solution[] }>({
    issues: [],
    solutions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, activityRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/activity`),
        ]);
        setProfile(profileRes.data);
        setActivity(activityRes.data || { issues: [], solutions: [] });
      } catch {
        // silent fail
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="flex gap-6 items-start">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User not found</h1>
      </div>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'issues', label: `Issues (${activity.issues?.length || 0})` },
    { key: 'solutions', label: `Solutions (${activity.solutions?.length || 0})` },
    { key: 'accepted', label: 'Accepted Solutions' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
            <UserIcon className="h-10 w-10 text-brand-600 dark:text-brand-400" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h1>
            {profile.bio && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
              {profile.industry && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{profile.industry}</span>
                </div>
              )}
              {profile.stage && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.stage}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>{profile.reputation_score} reputation</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-4">
          {activeTab === 'issues' &&
            (activity.issues?.length > 0 ? (
              activity.issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
            ) : (
              <p className="text-center py-8 text-gray-500">No issues posted yet.</p>
            ))}

          {activeTab === 'solutions' &&
            (activity.solutions?.length > 0 ? (
              activity.solutions.map((sol) => (
                <div key={sol.id} className="card p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {sol.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(new Date(sol.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-gray-500">No solutions posted yet.</p>
            ))}

          {activeTab === 'accepted' && (
            <div className="space-y-4">
              {activity.solutions?.filter((s) => s.is_accepted).length > 0 ? (
                activity.solutions
                  .filter((s) => s.is_accepted)
                  .map((sol) => (
                    <div key={sol.id} className="card p-4 border-green-200 dark:border-green-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {sol.content}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">Accepted solution</p>
                    </div>
                  ))
              ) : (
                <p className="text-center py-8 text-gray-500">No accepted solutions yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
