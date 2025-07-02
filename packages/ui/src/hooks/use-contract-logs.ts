import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLogService } from '@/lib/service-provider';
import { useToast } from '@/hooks/use-toast';
import type { DemoType } from '@logpanel/contract';

export const useRuns = () => {
  const service = useLogService();
  
  return useQuery({
    queryKey: ['runs'],
    queryFn: () => service.getRuns(),
  });
};

export const useLogs = (runId: string | null, searchQuery?: string, levels?: string[]) => {
  const service = useLogService();
  
  return useQuery({
    queryKey: ['logs', runId, searchQuery, levels?.join(',')],
    enabled: !!runId,
    queryFn: () => {
      if (!runId) return [];
      return service.getLogs(runId, {
        search: searchQuery,
        levels: levels as any, // Will be fixed when we update to use LogLevel type
      });
    },
  });
};

export const useRunStatistics = (runId: string | null) => {
  const service = useLogService();
  
  return useQuery({
    queryKey: ['run-stats', runId],
    enabled: !!runId,
    refetchInterval: 1000,
    queryFn: async () => {
      if (!runId) return null;
      
      const logs = await service.getLogs(runId);
      if (logs.length === 0) return null;

      const stats = {
        total: logs.length,
        info: 0,
        warn: 0,
        error: 0,
        start_time: logs[0].created_at,
      };

      logs.forEach((log) => {
        switch (log.level) {
          case 'INFO':
            stats.info++;
            break;
          case 'WARN':
            stats.warn++;
            break;
          case 'ERROR':
            stats.error++;
            break;
        }
        // Keep the earliest timestamp
        if (log.created_at < stats.start_time) {
          stats.start_time = log.created_at;
        }
      });

      return stats;
    },
  });
};

export const useClearLogs = () => {
  const service = useLogService();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (runId: string) => service.clearRun(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['run-stats'] });
      toast({
        title: "Success",
        description: "Logs cleared successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to clear logs: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useCreateDemoRun = () => {
  const service = useLogService();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (appType: string) => service.createDemoRun(appType as DemoType),
    onSuccess: (runId) => {
      toast({
        title: "Demo Run Created",
        description: `Created demo run: ${runId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['runs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create demo run: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}; 