import { useQuery } from "@tanstack/react-query";
import { formatTime, formatDuration } from "@/lib/utils";

interface LogStatisticsProps {
  runId: string | null;
}

export default function LogStatistics({ runId }: LogStatisticsProps) {
  const { data: stats } = useQuery({
    queryKey: ['/api/runs', runId, 'stats'],
    enabled: !!runId,
    queryFn: async () => {
      if (!runId) return null;
      const response = await fetch(`/api/runs/${runId}/stats`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch run statistics');
      }
      
      return response.json();
    },
    refetchInterval: 1000, // Update every second for duration
  });

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
