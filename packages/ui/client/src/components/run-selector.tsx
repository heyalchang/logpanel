import { cn } from "@/lib/utils";

interface Run {
  run_id: string;
  start_time: string;
  log_count: number;
  error_count: number;
}

interface RunSelectorProps {
  runs: Run[];
  selectedRunId: string | null;
  onRunSelect: (runId: string) => void;
}

export default function RunSelector({ runs, selectedRunId, onRunSelect }: RunSelectorProps) {
  return (
    <div className="p-4 border-b border-vscode-border">
      <h3 className="text-sm font-semibold mb-3 text-vscode-text">Active Runs</h3>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {runs.length === 0 ? (
          <div className="text-xs text-vscode-muted text-center py-4">
            No runs available. Create a demo run to get started.
          </div>
        ) : (
          runs.map((run) => (
            <div
              key={run.run_id}
              className={cn(
                "rounded p-2 cursor-pointer border",
                selectedRunId === run.run_id
                  ? "bg-vscode-accent bg-opacity-20 border-vscode-accent"
                  : "bg-vscode-bg border-vscode-border hover:bg-vscode-border hover:bg-opacity-30"
              )}
              onClick={() => onRunSelect(run.run_id)}
            >
              <div className={cn(
                "text-xs font-mono",
                selectedRunId === run.run_id ? "text-vscode-accent" : "text-vscode-text"
              )}>
                {run.run_id}
              </div>
              <div className="text-xs text-vscode-muted">
                {run.log_count} logs • {run.error_count} errors
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
