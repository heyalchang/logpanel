import type { LogService, LogFilters, DemoType } from '@logpanel/contract';
import type { LogRow, RunMeta } from '@logpanel/schema';
import { getDemoLogs } from './demo-data.js';

// In-memory storage
let logs: LogRow[] = [];
let nextId = 1;

export const mockLogService: LogService = {
  async getRuns(): Promise<RunMeta[]> {
    const runs = new Map<string, RunMeta>();
    
    logs.forEach((log) => {
      if (!runs.has(log.run_id)) {
        runs.set(log.run_id, {
          run_id: log.run_id,
          start_time: log.created_at,
          log_count: 0,
          error_count: 0,
        });
      }
      
      const run = runs.get(log.run_id)!;
      run.log_count++;
      
      if (log.level === 'ERROR') {
        run.error_count++;
      }
      
      // Keep the earliest timestamp as start_time
      if (log.created_at < run.start_time) {
        run.start_time = log.created_at;
      }
    });

    return Array.from(runs.values()).sort((a, b) => 
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
  },

  async getLogs(runId: string, filters?: LogFilters): Promise<LogRow[]> {
    let filteredLogs = logs.filter(log => log.run_id === runId);

    // Apply level filter
    if (filters?.levels && filters.levels.length > 0) {
      filteredLogs = filteredLogs.filter(log => 
        filters.levels!.includes(log.level)
      );
    }

    // Apply search filter
    if (filters?.search) {
      const regex = new RegExp(filters.search, 'i');
      filteredLogs = filteredLogs.filter((log) => 
        regex.test(log.message) || 
        (log.data && regex.test(JSON.stringify(log.data)))
      );
    }

    return filteredLogs.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  },

  async createDemoRun(type: DemoType): Promise<string> {
    const isoSeconds = new Date().toISOString().split('.')[0].replace(/[:]/g, '-');
    const runId = `${type}-${isoSeconds}`;
    
    const demoLogs = getDemoLogs(type);
    
    demoLogs.forEach((template) => {
      logs.push({
        id: nextId++,
        created_at: new Date().toISOString(),
        level: template.level,
        message: template.message,
        data: template.data,
        run_id: runId,
      });
    });
    
    return runId;
  },

  async clearRun(runId: string): Promise<void> {
    logs = logs.filter(log => log.run_id !== runId);
  },

  async exportRun(runId: string): Promise<LogRow[]> {
    return this.getLogs(runId);
  }
}; 