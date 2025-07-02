import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import type { Log } from "@shared/schema";

interface LogTableProps {
  logs: Log[];
  onLogSelect: (log: Log) => void;
}

export default function LogTable({ logs, onLogSelect }: LogTableProps) {
  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'INFO':
        return 'bg-log-info bg-opacity-20 text-log-info';
      case 'WARN':
        return 'bg-log-warn bg-opacity-20 text-log-warn';
      case 'ERROR':
        return 'bg-log-error bg-opacity-20 text-log-error';
      default:
        return 'bg-vscode-muted bg-opacity-20 text-vscode-muted';
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-xs font-mono">
        <thead className="sticky top-0 bg-vscode-panel border-b border-vscode-border">
          <tr>
            <th className="text-left p-2 w-20 text-vscode-muted">Level</th>
            <th className="text-left p-2 w-24 text-vscode-muted">Time</th>
            <th className="text-left p-2 flex-1 text-vscode-muted">Message</th>
            <th className="text-left p-2 w-16 text-vscode-muted">Data</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-vscode-muted">
                No logs available for this run
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-vscode-border border-opacity-30 hover:bg-vscode-panel hover:bg-opacity-50"
              >
                <td className="p-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getLevelBadgeClass(log.level)}`}>
                    {log.level}
                  </span>
                </td>
                <td className="p-2 text-vscode-muted">{formatTime(new Date(log.created_at))}</td>
                <td className="p-2">{log.message}</td>
                <td className="p-2">
                  {log.data && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-vscode-accent hover:underline text-xs"
                      onClick={() => onLogSelect(log)}
                    >
                      JSON
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
