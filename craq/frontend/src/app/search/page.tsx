'use client';

import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import IssueCard from '@/components/issues/IssueCard';
import { Issue, User, Tool } from '@/types';
import api from '@/lib/api';

type SearchType = 'all' | 'issues' | 'users' | 'tools';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<SearchType>('all');
  const [results, setResults] = useState<{
    issues: Issue[];
    users: User[];
    tools: Tool[];
  }>({ issues: [], users: [], tools: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ q: query });
      if (activeType !== 'all') params.append('type', activeType);
      const response = await api.get(`/search?${params}`);
      const data = response.data;
      setResults({
        issues: data.issues || [],
        users: data.users || [],
        tools: data.tools || [],
      });
    } catch {
      setResults({ issues: [], users: [], tools: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: { key: SearchType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'issues', label: 'Issues' },
    { key: 'users', label: 'Users' },
    { key: 'tools', label: 'Tools' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Search</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, users, tools..."
            className="input-field pl-12 py-3 text-lg"
          />
        </div>
      </form>

      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveType(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeType === tab.key
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          ))}
        </div>
      ) : !hasSearched ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Enter a search term to find issues, users, or tools.
        </div>
      ) : (
        <div className="space-y-6">
          {(activeType === 'all' || activeType === 'issues') && results.issues.length > 0 && (
            <div>
              {activeType === 'all' && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Issues</h2>
              )}
              <div className="space-y-3">
                {results.issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          )}

          {(activeType === 'all' || activeType === 'users') && results.users.length > 0 && (
            <div>
              {activeType === 'all' && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Users</h2>
              )}
              <div className="space-y-3">
                {results.users.map((user) => (
                  <a key={user.id} href={`/profile/${user.id}`} className="card p-4 block hover:border-brand-300 dark:hover:border-brand-700">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                    {user.bio && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{user.bio}</p>}
                  </a>
                ))}
              </div>
            </div>
          )}

          {(activeType === 'all' || activeType === 'tools') && results.tools.length > 0 && (
            <div>
              {activeType === 'all' && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Tools</h2>
              )}
              <div className="space-y-3">
                {results.tools.map((tool) => (
                  <a key={tool.id} href={`/tools/${tool.id}`} className="card p-4 block hover:border-brand-300 dark:hover:border-brand-700">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{tool.name}</div>
                    {tool.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{tool.description}</p>}
                  </a>
                ))}
              </div>
            </div>
          )}

          {results.issues.length === 0 && results.users.length === 0 && results.tools.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
