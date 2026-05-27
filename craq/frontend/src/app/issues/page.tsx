'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Inbox } from 'lucide-react';
import Link from 'next/link';
import IssueCard from '@/components/issues/IssueCard';
import IssueFilters from '@/components/issues/IssueFilters';
import Sidebar from '@/components/layout/Sidebar';
import { Issue } from '@/types';
import api from '@/lib/api';

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('trending');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchIssues = useCallback(async (pageNum: number, reset = false) => {
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '10',
        sort: sortBy,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      });
      const response = await api.get(`/issues?${params}`);
      const data = response.data;
      const newIssues = Array.isArray(data) ? data : data.data || [];

      if (reset) {
        setIssues(newIssues);
      } else {
        setIssues((prev) => [...prev, ...newIssues]);
      }
      setHasMore(newIssues.length === 10);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, filters]);

  useEffect(() => {
    setPage(1);
    setIsLoading(true);
    fetchIssues(1, true);
  }, [fetchIssues]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchIssues(nextPage);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Issues Feed
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Explore challenges from the community
          </p>
        </div>
        <Link href="/issues/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Issue
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="hidden lg:block">
          <Sidebar filters={filters} onFilterChange={handleFilterChange} />
        </div>

        <div className="flex-1 space-y-4">
          <IssueFilters sortBy={sortBy} onSortChange={setSortBy} />

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-gray-800/60 to-transparent animate-shimmer bg-[length:200%_100%]" />
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="card p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 dot-grid-pattern opacity-30" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900/30 dark:to-accent-900/30 mb-4">
                  <Inbox className="h-8 w-8 text-brand-500 dark:text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  No issues found
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Be the first to share a business challenge!
                </p>
                <Link href="/issues/new" className="btn-primary mt-6 inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Post an Issue
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>

              {hasMore && (
                <div className="text-center pt-6">
                  <button onClick={loadMore} className="btn-secondary px-8">
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
