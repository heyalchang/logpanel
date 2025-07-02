import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { format } from 'date-fns';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Search,
  Pause,
  Play,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Terminal
} from 'lucide-react';
import { JSONTree } from 'react-json-tree';
import clsx from 'clsx';
import { supabase } from './supabase';
import { LogRow } from './types';

interface LiveTabProps {
  darkMode: boolean;
  onLogCountChange: (count: number) => void;
}

interface LogItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    logs: LogRow[];
    darkMode: boolean;
    expandedRows: Set<number>;
    toggleExpanded: (id: number) => void;
    onCopy: (log: LogRow) => void;
  };
}

const LogItem = memo(({ index, style, data }: LogItemProps) => {
  const { logs, darkMode, expandedRows, toggleExpanded, onCopy } = data;
  const log = logs[index];
  const isExpanded = expandedRows.has(log.id);

  const levelConfig = {
    ERROR: { 
      icon: AlertCircle, 
      color: darkMode ? 'text-red-400' : 'text-red-600',
      bg: darkMode ? 'bg-red-900/20' : 'bg-red-50',
      border: darkMode ? 'border-red-800' : 'border-red-200'
    },
    WARN: { 
      icon: AlertTriangle, 
      color: darkMode ? 'text-yellow-400' : 'text-yellow-600',
      bg: darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
      border: darkMode ? 'border-yellow-800' : 'border-yellow-200'
    },
    INFO: { 
      icon: Info, 
      color: darkMode ? 'text-blue-400' : 'text-blue-600',
      bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
      border: darkMode ? 'border-blue-800' : 'border-blue-200'
    }
  };

  const config = levelConfig[log.level as keyof typeof levelConfig] || levelConfig.INFO;
  const Icon = config.icon;

  return (
    <div style={style}>
      <div
        className={clsx(
          'mx-4 my-1 rounded-lg border transition-all duration-150',
          config.bg,
          config.border,
          darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100/50'
        )}
      >
        <div className="flex items-start gap-3 p-3">
          {/* Level Icon */}
          <Icon className={clsx('w-5 h-5 mt-0.5 flex-shrink-0', config.color)} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                {/* Timestamp & Run ID */}
                <div className="flex items-center gap-3 mb-1">
                  <time className={clsx(
                    'text-xs font-mono',
                    darkMode ? 'text-gray-500' : 'text-gray-600'
                  )}>
                    {format(new Date(log.created_at), 'HH:mm:ss.SSS')}
                  </time>
                  {log.run_id && (
                    <span className={clsx(
                      'text-xs px-1.5 py-0.5 rounded font-mono',
                      darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                    )}>
                      {log.run_id.slice(0, 8)}
                    </span>
                  )}
                </div>

                {/* Message */}
                <p className={clsx(
                  'text-sm break-words',
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                )}>
                  {log.message}
                </p>

                {/* JSON Data */}
                {log.data && Object.keys(log.data).length > 0 && (
                  <button
                    onClick={() => toggleExpanded(log.id)}
                    className={clsx(
                      'flex items-center gap-1 mt-2 text-xs font-medium',
                      darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
                    )}
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span>{Object.keys(log.data).length} properties</span>
                  </button>
                )}
              </div>

              {/* Actions */}
              <button
                onClick={() => onCopy(log)}
                className={clsx(
                  'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                )}
                title="Copy log"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Expanded JSON */}
            {isExpanded && log.data && (
              <div className={clsx(
                'mt-2 p-2 rounded text-xs overflow-auto',
                darkMode ? 'bg-gray-800' : 'bg-gray-100'
              )}>
                <JSONTree
                  data={log.data}
                  theme={{
                    scheme: darkMode ? 'monokai' : 'default',
                    base00: darkMode ? '#1e1e1e' : '#ffffff',
                    base01: darkMode ? '#383838' : '#f5f5f5',
                    base02: darkMode ? '#424242' : '#ebebeb',
                    base03: darkMode ? '#545454' : '#d6d6d6',
                    base04: darkMode ? '#696969' : '#b4b4b4',
                    base05: darkMode ? '#c9c9c9' : '#585858',
                    base06: darkMode ? '#e0e0e0' : '#3e3e3e',
                    base07: darkMode ? '#ffffff' : '#202020',
                    base08: darkMode ? '#ff6188' : '#d7005f',
                    base09: darkMode ? '#fc9867' : '#d75f00',
                    base0A: darkMode ? '#ffd866' : '#d7af00',
                    base0B: darkMode ? '#a9dc76' : '#5faf00',
                    base0C: darkMode ? '#78dce8' : '#005f87',
                    base0D: darkMode ? '#78dce8' : '#0087d7',
                    base0E: darkMode ? '#ab9df2' : '#8700d7',
                    base0F: darkMode ? '#ff6188' : '#d70000'
                  }}
                  hideRoot
                  shouldExpandNodeInitially={() => true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

LogItem.displayName = 'LogItem';

export default function LiveTab({ darkMode, onLogCountChange }: LiveTabProps) {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [paused, setPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);

  // Filter logs based on search
  const filteredLogs = logs.filter(log => 
    searchTerm === '' || 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    onLogCountChange(filteredLogs.length);
  }, [filteredLogs.length, onLogCountChange]);

  // Handle container resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Fetch initial logs and set up subscription
  useEffect(() => {
    let subscription: any;

    const fetchLogs = async () => {
      const { data } = await supabase
        .from('logs')
        .select('*')
        .order('id', { ascending: false })
        .limit(1000);

      if (data) {
        setLogs(data as LogRow[]);
      }
    };

    fetchLogs();

    if (!paused) {
      subscription = supabase
        .channel('logs-stream')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'logs' },
          payload => {
            setLogs(current => [payload.new as LogRow, ...current].slice(0, 10000));
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [paused]);

  const toggleExpanded = useCallback((id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCopy = useCallback((log: LogRow) => {
    const text = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(text);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setExpandedRows(new Set());
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className={clsx(
        'flex items-center gap-2 px-4 py-2 border-b',
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      )}>
        {/* Search */}
        <div className="flex-1 relative">
          <Search className={clsx(
            'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
            darkMode ? 'text-gray-500' : 'text-gray-400'
          )} />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={clsx(
              'w-full pl-10 pr-4 py-1.5 text-sm rounded-md border transition-colors',
              darkMode 
                ? 'bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-blue-400'
            )}
          />
        </div>

        {/* Controls */}
        <button
          onClick={() => setPaused(!paused)}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            paused
              ? darkMode 
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
              : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          )}
        >
          {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {paused ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={clearLogs}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          )}
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Log List */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className={clsx(
            'flex items-center justify-center h-full',
            darkMode ? 'text-gray-500' : 'text-gray-400'
          )}>
            <div className="text-center">
              <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No logs yet</p>
              <p className="text-xs mt-1">Waiting for incoming logs...</p>
            </div>
          </div>
        ) : (
          <List
            ref={listRef}
            height={containerHeight}
            itemCount={filteredLogs.length}
            itemSize={80}
            itemData={{
              logs: filteredLogs,
              darkMode,
              expandedRows,
              toggleExpanded,
              onCopy: handleCopy
            }}
            className="custom-scrollbar"
          >
            {LogItem}
          </List>
        )}
      </div>
    </div>
  );
}