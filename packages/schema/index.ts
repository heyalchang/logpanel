// Core types for the log viewer
export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogRow {
  id: number;
  created_at: string; // ISO timestamp
  level: LogLevel;
  message: string;
  data?: unknown; // JSON payload
  run_id: string;
}

export interface RunMeta {
  run_id: string;
  start_time: string;
  log_count: number;
  error_count: number;
} 