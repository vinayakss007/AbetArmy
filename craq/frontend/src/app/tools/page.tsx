'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ExternalLink, Grid, List } from 'lucide-react';
import { Tool } from '@/types';
import api from '@/lib/api';

const categories = ['All', 'Marketing', 'Finance', 'Operations', 'Sales', 'Product', 'HR', 'Legal', 'Technology'];

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTools = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== 'All') params.append('category', category.toLowerCase());
        if (searchQuery) params.append('search', searchQuery);
        const response = await api.get(`/tools?${params}`);
        setTools(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch {
        setTools([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTools();
  }, [category, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tools Directory</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-gray-400'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-gray-400'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tools..."
          className="input-field sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                category === cat
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          ))}
        </div>
      ) : tools.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No tools found.</p>
        </div>
      ) : (
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
          {tools.map((tool) => (
            <Link key={tool.id} href={`/tools/${tool.id}`}>
              <div className="card p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-colors h-full">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {tool.name}
                  </h3>
                  {tool.url && <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                </div>
                {tool.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {tool.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  {tool.category && (
                    <span className="text-xs font-medium text-brand-600 dark:text-brand-400 capitalize">
                      {tool.category}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {tool.average_rating?.toFixed(1) || 'N/A'}
                    </span>
                    {tool.review_count !== undefined && (
                      <span className="text-xs text-gray-500">({tool.review_count})</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
