import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LogTable from "@/components/log-table";
import LogDataModal from "@/components/log-data-modal";
import RunSelector from "@/components/run-selector";
import LogStatistics from "@/components/log-statistics";
import DemoControls from "@/components/demo-controls";
import { useRuns, useLogs, useClearLogs } from "@/hooks/use-supabase-logs";
import type { Log } from "@shared/schema";

export default function LogViewer() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['INFO', 'WARN', 'ERROR']);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const { data: runs = [] } = useRuns();
  const { data: logs = [] } = useLogs(selectedRunId, searchQuery, selectedLevels);
  const clearLogsMutation = useClearLogs();

  // Set initial run if not selected
  if (!selectedRunId && runs.length > 0) {
    setSelectedRunId(runs[0].run_id);
  }

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleClearLogs = async () => {
    if (!selectedRunId) return;
    clearLogsMutation.mutate(selectedRunId);
  };

  const handleExportLogs = () => {
    if (!logs.length) return;
    
    const jsonData = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${selectedRunId}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-vscode-bg text-vscode-text overflow-hidden">
      {/* Title Bar */}
      <div className="bg-vscode-panel border-b border-vscode-border px-4 py-2 flex items-center justify-between select-none">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-sm font-medium">ASA - Any-Source-Anywhere Log Viewer</div>
        <div className="w-16"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-vscode-panel border-r border-vscode-border flex flex-col">
          <DemoControls />
          <RunSelector 
            runs={runs}
            selectedRunId={selectedRunId}
            onRunSelect={setSelectedRunId}
          />
          <LogStatistics runId={selectedRunId} />
        </div>

        {/* Main Log Viewer */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-vscode-panel border-b border-vscode-border p-3 flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search logs... (supports regex)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-vscode-bg border-vscode-border font-mono text-sm placeholder:text-vscode-muted focus:border-vscode-accent"
              />
            </div>
            <div className="flex items-center space-x-2">
              {['INFO', 'WARN', 'ERROR'].map(level => (
                <Button
                  key={level}
                  size="sm"
                  variant="outline"
                  className={`px-2 py-1 text-xs font-semibold ${
                    selectedLevels.includes(level)
                      ? `bg-log-${level.toLowerCase()} bg-opacity-20 text-log-${level.toLowerCase()} border-log-${level.toLowerCase()}`
                      : 'bg-vscode-bg border-vscode-border text-vscode-muted hover:bg-vscode-border hover:bg-opacity-30'
                  }`}
                  onClick={() => toggleLevel(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="px-3 py-1.5 bg-vscode-bg border-vscode-border text-xs hover:bg-vscode-border hover:bg-opacity-30"
              onClick={handleClearLogs}
            >
              Clear
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="px-3 py-1.5 bg-vscode-bg border-vscode-border text-xs hover:bg-vscode-border hover:bg-opacity-30"
              onClick={handleExportLogs}
            >
              Export
            </Button>
          </div>

          {/* Log Table */}
          <LogTable logs={logs} onLogSelect={setSelectedLog} />
        </div>
      </div>

      {/* Log Data Modal */}
      <LogDataModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
