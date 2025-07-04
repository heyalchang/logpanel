import { formatTime, formatDuration } from "@/lib/utils";
import { useRunStatistics } from "@/hooks/use-contract-logs";

interface LogStatisticsProps {
  runId: string | null;
}

export default function LogStatistics({ runId }: LogStatisticsProps) {
  const { data: stats } = useRunStatistics(runId);

  if (!runId || !stats) {
    return (
      <div className="p-4 flex-1">
        <h3 className="text-sm font-semibold mb-3 text-vscode-text">Current Run Stats</h3>
        <div className="text-xs text-vscode-muted text-center">
          Select a run to view statistics
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex-1">
      <h3 className="text-sm font-semibold mb-3 text-vscode-text">Current Run Stats</h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-vscode-muted">Total Logs:</span>
          <span>{stats.total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-log-info">INFO:</span>
          <span>{stats.info}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-log-warn">WARN:</span>
          <span>{stats.warn}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-log-error">ERROR:</span>
          <span>{stats.error}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-vscode-border">
          <span className="text-vscode-muted">Started:</span>
          <span className="text-xs">{formatTime(new Date(stats.start_time))}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-vscode-muted">Duration:</span>
          <span className="text-xs">{formatDuration(new Date(stats.start_time))}</span>
        </div>
      </div>
    </div>
  );
}
