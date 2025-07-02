import type { LogRow, RunMeta, LogLevel } from '@logpanel/schema';

export type DemoType = 'web-server' | 'api-service' | 'worker' | 'mobile-app' | 'iot-device';

export interface LogFilters {
  levels?: LogLevel[];
  search?: string;
}

export interface LogService {
  // "I want to see what my app is doing"
  getRuns(): Promise<RunMeta[]>;
  
  // "Too much noise, just show me errors" + "When did that weird thing happen?"
  getLogs(runId: string, filters?: LogFilters): Promise<LogRow[]>;
  
  // "I need test data for my demo"
  createDemoRun(type: DemoType): Promise<string>; // returns run_id
  
  // Utility functions
  clearRun(runId: string): Promise<void>;
  exportRun(runId: string): Promise<LogRow[]>;
}

// Export a placeholder that implementations will override
export let logService: LogService; 