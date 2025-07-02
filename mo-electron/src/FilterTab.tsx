import React, { useState } from 'react';
import { Search, Calendar, Hash, AlertCircle, AlertTriangle, Info, Filter } from 'lucide-react';
import clsx from 'clsx';

interface FilterTabProps {
  darkMode: boolean;
}

export default function FilterTab({ darkMode }: FilterTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set(['INFO', 'WARN', 'ERROR']));
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [runIdFilter, setRunIdFilter] = useState('');
  const [useRegex, setUseRegex] = useState(false);

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const levels = [
    { name: 'INFO', icon: Info, color: darkMode ? 'text-blue-400' : 'text-blue-600' },
    { name: 'WARN', icon: AlertTriangle, color: darkMode ? 'text-yellow-400' : 'text-yellow-600' },
    { name: 'ERROR', icon: AlertCircle, color: darkMode ? 'text-red-400' : 'text-red-600' }
  ];

  return (
    <div className={clsx(
      'h-full overflow-auto p-6',
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    )}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-semibold">Filter Logs</h2>
        </div>

        {/* Search Query */}
        <div>
          <label className={clsx(
            'block text-sm font-medium mb-2',
            darkMode ? 'text-gray-300' : 'text-gray-700'
          )}>
            Search Query
          </label>
          <div className="relative">
            <Search className={clsx(
              'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
              darkMode ? 'text-gray-500' : 'text-gray-400'
            )} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in messages and data..."
              className={clsx(
                'w-full pl-10 pr-4 py-2 rounded-md border transition-colors',
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-400'
              )}
            />
          </div>
          
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="rounded"
            />
            <span className={clsx(
              'text-sm',
              darkMode ? 'text-gray-400' : 'text-gray-600'
            )}>
              Use regular expressions
            </span>
          </label>
        </div>

        {/* Log Levels */}
        <div>
          <label className={clsx(
            'block text-sm font-medium mb-2',
            darkMode ? 'text-gray-300' : 'text-gray-700'
          )}>
            Log Levels
          </label>
          <div className="flex gap-2">
            {levels.map(({ name, icon: Icon, color }) => (
              <button
                key={name}
                onClick={() => toggleLevel(name)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-md border transition-all',
                  selectedLevels.has(name)
                    ? darkMode
                      ? 'bg-gray-800 border-gray-600'
                      : 'bg-white border-gray-300 shadow-sm'
                    : darkMode
                      ? 'bg-gray-900 border-gray-700 opacity-50'
                      : 'bg-gray-100 border-gray-200 opacity-50'
                )}
              >
                <Icon className={clsx('w-4 h-4', color)} />
                <span className="text-sm font-medium">{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={clsx(
              'block text-sm font-medium mb-2',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}>
              From Date
            </label>
            <div className="relative">
              <Calendar className={clsx(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                darkMode ? 'text-gray-500' : 'text-gray-400'
              )} />
              <input
                type="datetime-local"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={clsx(
                  'w-full pl-10 pr-4 py-2 rounded-md border transition-colors',
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-800 focus:border-blue-400'
                )}
              />
            </div>
          </div>
          
          <div>
            <label className={clsx(
              'block text-sm font-medium mb-2',
              darkMode ? 'text-gray-300' : 'text-gray-700'
            )}>
              To Date
            </label>
            <div className="relative">
              <Calendar className={clsx(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                darkMode ? 'text-gray-500' : 'text-gray-400'
              )} />
              <input
                type="datetime-local"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={clsx(
                  'w-full pl-10 pr-4 py-2 rounded-md border transition-colors',
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-800 focus:border-blue-400'
                )}
              />
            </div>
          </div>
        </div>

        {/* Run ID Filter */}
        <div>
          <label className={clsx(
            'block text-sm font-medium mb-2',
            darkMode ? 'text-gray-300' : 'text-gray-700'
          )}>
            Run ID
          </label>
          <div className="relative">
            <Hash className={clsx(
              'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
              darkMode ? 'text-gray-500' : 'text-gray-400'
            )} />
            <input
              type="text"
              value={runIdFilter}
              onChange={(e) => setRunIdFilter(e.target.value)}
              placeholder="Filter by run ID..."
              className={clsx(
                'w-full pl-10 pr-4 py-2 rounded-md border transition-colors',
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-400'
              )}
            />
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex gap-3 pt-4">
          <button
            className={clsx(
              'px-6 py-2 rounded-md font-medium transition-colors',
              darkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            )}
          >
            Apply Filters
          </button>
          
          <button
            className={clsx(
              'px-6 py-2 rounded-md font-medium transition-colors',
              darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            Reset
          </button>
        </div>

        {/* Info Message */}
        <div className={clsx(
          'p-4 rounded-md text-sm',
          darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-700'
        )}>
          <p>Filters will be applied to fetch matching logs from the database. Results will replace the current live stream view.</p>
        </div>
      </div>
    </div>
  );
}