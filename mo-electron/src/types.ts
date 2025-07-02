export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogRow {
  id: number;
  created_at: string;
  level: LogLevel;
  message: string;
  data: unknown | null;
  run_id: string;
}