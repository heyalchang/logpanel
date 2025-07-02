import { createClient } from '@supabase/supabase-js';
import type { LogService, LogFilters, DemoType } from '@logpanel/contract';
import type { LogRow, RunMeta } from '@logpanel/schema';
import { getDemoLogs } from './demo-data.js';

// Initialize Supabase client
// @ts-ignore - Vite environment variables
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
// @ts-ignore - Vite environment variables  
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseLogService: LogService = {
  async getRuns(): Promise<RunMeta[]> {
    const { data, error } = await supabase
      .from('logs')
      .select('run_id, created_at, level')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by run_id and calculate stats
    const runs = new Map<string, RunMeta>();
    
    data?.forEach((log: any) => {
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
    let query = supabase
      .from('logs')
      .select('*')
      .eq('run_id', runId)
      .order('created_at', { ascending: true });

    // Apply level filter if specified
    if (filters?.levels && filters.levels.length > 0) {
      query = query.in('level', filters.levels);
    }

    const { data, error } = await query;
    if (error) throw error;

    let logs = data as LogRow[];

    // Apply search filter on client side
    if (filters?.search) {
      const regex = new RegExp(filters.search, 'i');
      logs = logs.filter((log) => 
        regex.test(log.message) || 
        (log.data && regex.test(JSON.stringify(log.data)))
      );
    }

    return logs;
  },

  async createDemoRun(type: DemoType): Promise<string> {
    const isoSeconds = new Date().toISOString().split('.')[0].replace(/[:]/g, '-');
    const runId = `${type}-${isoSeconds}`;
    
    const demoLogs = getDemoLogs(type);
    
    for (const template of demoLogs) {
      const { error } = await supabase
        .from('logs')
        .insert([{
          level: template.level,
          message: template.message,
          data: template.data,
          run_id: runId,
        }]);
        
      if (error) throw error;
    }
    
    return runId;
  },

  async clearRun(runId: string): Promise<void> {
    const { error } = await supabase
      .from('logs')
      .delete()
      .eq('run_id', runId);
    
    if (error) throw error;
  },

  async exportRun(runId: string): Promise<LogRow[]> {
    return this.getLogs(runId);
  }
}; 