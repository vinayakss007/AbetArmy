'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Issues Feed</h1>
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
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No issues found. Be the first to post one!
              </p>
              <Link href="/issues/new" className="btn-primary mt-4 inline-block">
                Post an Issue
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>

              {hasMore && (
                <div className="text-center pt-4">
                  <button onClick={loadMore} className="btn-secondary">
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
