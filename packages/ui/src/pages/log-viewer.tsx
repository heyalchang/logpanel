import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import LogTable from "@/components/log-table";
import LogDataModal from "@/components/log-data-modal";
import RunSelector from "@/components/run-selector";
import LogStatistics from "@/components/log-statistics";
import FloatingTestPanel from "@/components/floating-test-panel";
import { useRuns, useLogs, useClearLogs } from "@/hooks/use-contract-logs";
import { useToast } from "@/hooks/use-toast";
import type { Log } from "@shared/schema";

export default function LogViewer() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['INFO', 'WARN', 'ERROR']);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const { toast } = useToast();

  const { data: runs = [] } = useRuns();
  const { data: logs = [] } = useLogs(selectedRunId, searchQuery, selectedLevels);
  const clearLogsMutation = useClearLogs();

  // Set initial run if not selected
  if (!selectedRunId && runs.length > 0) {
    setSelectedRunId(runs[0].run_id);
  }

  const toggleLevel = (level: string, checked: boolean) => {
    setSelectedLevels(prev => {
      const without = prev.filter(l => l !== level);
      return checked ? [...without, level] : without;
    });
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
    <div className="h-screen flex flex-col bg-vscode-bg text-vscode-text overflow-auto">
      {/* Title Bar */}
      <div className="bg-vscode-panel border-b border-vscode-border px-4 py-2 flex items-center justify-between select-none">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-sm font-medium flex items-center space-x-4">
          <span>ASA Log Viewer</span>
        </div>
        <div className="w-16"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-vscode-panel border-r border-vscode-border flex flex-col">
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
            <div className="flex items-center space-x-4">
              {['INFO', 'WARN', 'ERROR'].map(level => {
                const color = `text-log-${level.toLowerCase()}`;
                return (
                  <label key={level} className="flex items-center space-x-1 cursor-pointer select-none">
                    <Checkbox
                      checked={selectedLevels.includes(level)}
                      onCheckedChange={(checked) => toggleLevel(level, !!checked)}
                      className={`border-vscode-border focus:ring-0 focus:ring-offset-0 data-[state=checked]:bg-${level.toLowerCase()}-500 data-[state=checked]:border-${level.toLowerCase()}-500`}
                    />
                    <span className={`${color} text-xs`}>{level}</span>
                  </label>
                );
              })}
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

          {/* Log Table or Empty State */}
          {selectedLevels.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-vscode-muted select-none">
              No log levels selected. Enable at least one level to display logs.
            </div>
          ) : (
            <LogTable logs={logs} onLogSelect={setSelectedLog} />
          )}
        </div>
      </div>

      {/* Log Data Modal */}
      <LogDataModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />

      {/* Floating test data generator */}
      <FloatingTestPanel />
    </div>
  );
}
