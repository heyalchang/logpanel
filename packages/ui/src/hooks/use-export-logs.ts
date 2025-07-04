import { useCallback } from 'react';
import type { Log } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export type ExportFormat = 'json' | 'txt';

export function useExportLogs(logs: Log[], runId: string | null) {
  const { toast } = useToast();
  return useCallback(
    (format: ExportFormat) => {
      if (!logs.length || !runId) return;

      const content =
        format === 'json'
          ? JSON.stringify(logs, null, 2)
          : logs
              .map(
                (log) =>
                  `[${log.created_at}] ${log.level} ${log.message}` +
                  (log.data ? ` ${JSON.stringify(log.data)}` : '')
              )
              .join('\n');

      const blob = new Blob([content], {
        type: format === 'json' ? 'application/json' : 'text/plain',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${runId}-${new Date().toISOString().slice(0, 10)}.${
        format === 'json' ? 'json' : 'txt'
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: 'Exported Logs',
        description: `Downloaded ${format.toUpperCase()} file`,
      });
    },
    [logs, runId]
  );
}
