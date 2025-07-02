import React, { useState, useEffect } from 'react';
import { Settings, Database, Key, Save, RefreshCw, Check, X, Zap, Archive } from 'lucide-react';
import clsx from 'clsx';

interface SettingsTabProps {
  darkMode: boolean;
}

export default function SettingsTab({ darkMode }: SettingsTabProps) {
  const [url, setUrl] = useState(import.meta.env.VITE_SUPABASE_URL ?? '');
  const [key, setKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '');
  const [saved, setSaved] = useState(false);
  
  // Performance settings
  const [maxLogs, setMaxLogs] = useState('10000');
  const [scrollBuffer, setScrollBuffer] = useState('100');
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Display settings
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showRunId, setShowRunId] = useState(true);
  const [expandJsonByDefault, setExpandJsonByDefault] = useState(false);
  
  const handleSave = () => {
    // In a real implementation, this would persist to localStorage or a config file
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={clsx(
      'h-full overflow-auto p-6',
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    )}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-semibold">Settings</h2>
        </div>

        {/* Database Configuration */}
        <section>
          <h3 className={clsx(
            'text-lg font-medium mb-4 flex items-center gap-2',
            darkMode ? 'text-gray-200' : 'text-gray-800'
          )}>
            <Database className="w-5 h-5" />
            Database Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                darkMode ? 'text-gray-300' : 'text-gray-700'
              )}>
                Supabase URL
              </label>
              <div className="relative">
                <Database className={clsx(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                )} />
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className={clsx(
                    'w-full pl-10 pr-4 py-2 rounded-md border transition-colors font-mono text-sm',
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-400'
                  )}
                />
              </div>
            </div>
            
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                darkMode ? 'text-gray-300' : 'text-gray-700'
              )}>
                Anonymous Key
              </label>
              <div className="relative">
                <Key className={clsx(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                )} />
                <input
                  type="password"
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className={clsx(
                    'w-full pl-10 pr-4 py-2 rounded-md border transition-colors font-mono text-sm',
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-400'
                  )}
                />
              </div>
            </div>
            
            <div className={clsx(
              'p-3 rounded-md text-sm',
              darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'
            )}>
              <p>Changes to database configuration require an app restart to take effect.</p>
            </div>
          </div>
        </section>

        {/* Performance Settings */}
        <section>
          <h3 className={clsx(
            'text-lg font-medium mb-4 flex items-center gap-2',
            darkMode ? 'text-gray-200' : 'text-gray-800'
          )}>
            <Zap className="w-5 h-5" />
            Performance
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                darkMode ? 'text-gray-300' : 'text-gray-700'
              )}>
                Maximum Logs in Memory
              </label>
              <input
                type="number"
                value={maxLogs}
                onChange={e => setMaxLogs(e.target.value)}
                min="100"
                max="100000"
                className={clsx(
                  'w-full px-4 py-2 rounded-md border transition-colors',
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-800 focus:border-blue-400'
                )}
              />
              <p className={clsx(
                'text-xs mt-1',
                darkMode ? 'text-gray-500' : 'text-gray-600'
              )}>
                Higher values use more memory but allow viewing more historical logs
              </p>
            </div>
            
            <div>
              <label className={clsx(
                'block text-sm font-medium mb-2',
                darkMode ? 'text-gray-300' : 'text-gray-700'
              )}>
                Virtual Scroll Buffer Size
              </label>
              <input
                type="number"
                value={scrollBuffer}
                onChange={e => setScrollBuffer(e.target.value)}
                min="10"
                max="500"
                className={clsx(
                  'w-full px-4 py-2 rounded-md border transition-colors',
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-800 focus:border-blue-400'
                )}
              />
              <p className={clsx(
                'text-xs mt-1',
                darkMode ? 'text-gray-500' : 'text-gray-600'
              )}>
                Number of logs to render outside the visible area
              </p>
            </div>
          </div>
        </section>

        {/* Display Settings */}
        <section>
          <h3 className={clsx(
            'text-lg font-medium mb-4 flex items-center gap-2',
            darkMode ? 'text-gray-200' : 'text-gray-800'
          )}>
            <Archive className="w-5 h-5" />
            Display
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={e => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              <span className={clsx(
                'text-sm',
                darkMode ? 'text-gray-300' : 'text-gray-700'
              )}>
                Auto-scroll to new logs
              </span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showTimestamps}
                onChange={e => setShowTimestamps(e.target.checked)}
                className="rounded"
              />
              <span className={clsx(
                'text-sm',
                darkMode ? 'text-gray-300' : 'text-gray-700'
              )}>
                Show timestamps
              </span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showRunId}
                onChange={e => setShowRunId(e.target.checked)}
                className="rounded"
              />
              <span className={clsx(
                'text-sm',
                darkMode ? 'text-gray-300' : 'text-gray-700'
              )}>
                Show run IDs
              </span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={expandJsonByDefault}
                onChange={e => setExpandJsonByDefault(e.target.checked)}
                className="rounded"
              />
              <span className={clsx(
                'text-sm',
                darkMode ? 'text-gray-300' : 'text-gray-700'
              )}>
                Expand JSON data by default
              </span>
            </label>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            className={clsx(
              'flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors',
              saved
                ? 'bg-green-600 text-white'
                : darkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
            )}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
          
          <button
            className={clsx(
              'flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors',
              darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}