'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSection {
  label: string;
  options: string[];
}

interface SidebarProps {
  filters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
}

const filterSections: FilterSection[] = [
  {
    label: 'Category',
    options: ['Marketing', 'Finance', 'Operations', 'Sales', 'Product', 'HR', 'Legal', 'Technology'],
  },
  {
    label: 'Industry',
    options: ['SaaS', 'E-commerce', 'Healthcare', 'FinTech', 'EdTech', 'Marketplace', 'Agency', 'Other'],
  },
  {
    label: 'Stage',
    options: ['Idea', 'MVP', 'Early Revenue', 'Growth', 'Scale', 'Mature'],
  },
  {
    label: 'Status',
    options: ['Open', 'Solved'],
  },
];

export default function Sidebar({ filters = {}, onFilterChange }: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Category: true,
    Industry: true,
    Stage: false,
    Status: true,
  });

  const toggleSection = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="card p-4 sticky top-20">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
          Filters
        </h2>

        {filterSections.map((section) => (
          <div key={section.label} className="mb-4">
            <button
              onClick={() => toggleSection(section.label)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {section.label}
              {expanded[section.label] ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expanded[section.label] && (
              <div className="space-y-1">
                {section.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    <input
                      type="radio"
                      name={section.label.toLowerCase()}
                      checked={filters[section.label.toLowerCase()] === option.toLowerCase()}
                      onChange={() => onFilterChange?.(section.label.toLowerCase(), option.toLowerCase())}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    {option}
                  </label>
                ))}
                {filters[section.label.toLowerCase()] && (
                  <button
                    onClick={() => onFilterChange?.(section.label.toLowerCase(), '')}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
