import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Filter, 
  Settings, 
  Wifi, 
  WifiOff,
  Moon,
  Sun,
  Terminal
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import clsx from 'clsx';
import LiveTab from './LiveTab';
import FilterTab from './FilterTab';
import SettingsTab from './SettingsTab';
import { supabase } from './supabase';

type Tab = 'live' | 'filter' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('live');
  const [connected, setConnected] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [logCount, setLogCount] = useState(0);

  // Keyboard shortcuts
  useHotkeys('cmd+1, ctrl+1', () => setTab('live'));
  useHotkeys('cmd+2, ctrl+2', () => setTab('filter'));
  useHotkeys('cmd+3, ctrl+3', () => setTab('settings'));
  useHotkeys('cmd+d, ctrl+d', () => setDarkMode(!darkMode));

  useEffect(() => {
    // Check Supabase connection
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('logs').select('count').single();
        setConnected(!error);
      } catch {
        setConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'live', label: 'Live Stream', icon: Activity, hotkey: '⌘1' },
    { id: 'filter', label: 'Filter', icon: Filter, hotkey: '⌘2' },
    { id: 'settings', label: 'Settings', icon: Settings, hotkey: '⌘3' },
  ] as const;

  return (
    <div className={clsx(
      'flex flex-col h-screen transition-colors duration-200',
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    )}>
      {/* Header */}
      <header className={clsx(
        'border-b flex items-center justify-between px-4 py-2',
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      )}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-lg">ASA Log Viewer</span>
          </div>
          
          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 ml-8">
            {tabs.map(({ id, label, icon: Icon, hotkey }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-150',
                  'hover:bg-opacity-10 hover:bg-white',
                  tab === id 
                    ? darkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                    : darkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-800'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
                <kbd className={clsx(
                  'text-xs px-1 rounded opacity-50',
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                )}>
                  {hotkey}
                </kbd>
              </button>
            ))}
          </nav>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-4">
          {/* Log Counter */}
          <div className={clsx(
            'text-sm px-2 py-1 rounded',
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          )}>
            <span className="opacity-70">Logs:</span>{' '}
            <span className="font-mono font-medium">{logCount.toLocaleString()}</span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500">Disconnected</span>
              </>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={clsx(
              'p-2 rounded-md transition-colors',
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
            )}
            title="Toggle dark mode (⌘D)"
          >
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {tab === 'live' && <LiveTab darkMode={darkMode} onLogCountChange={setLogCount} />}
        {tab === 'filter' && <FilterTab darkMode={darkMode} />}
        {tab === 'settings' && <SettingsTab darkMode={darkMode} />}
      </main>

      {/* Footer Status Bar */}
      <footer className={clsx(
        'border-t px-4 py-1 text-xs flex items-center justify-between',
        darkMode 
          ? 'bg-gray-800 border-gray-700 text-gray-400'
          : 'bg-gray-100 border-gray-200 text-gray-600'
      )}>
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span>•</span>
          <span>Press ? for help</span>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>•</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
}