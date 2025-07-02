import { users, logs, type User, type InsertUser, type Log, type InsertLog } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Log operations
  createLog(log: InsertLog): Promise<Log>;
  getLogsByRunId(runId: string): Promise<Log[]>;
  getAllRuns(): Promise<{ run_id: string; start_time: Date; log_count: number; error_count: number }[]>;
  getRunStatistics(runId: string): Promise<{
    total: number;
    info: number;
    warn: number;
    error: number;
    start_time: Date;
  } | null>;
  searchLogs(runId: string, query?: string, levels?: string[]): Promise<Log[]>;
  clearLogs(runId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private logs: Map<number, Log>;
  private currentUserId: number;
  private currentLogId: number;

  constructor() {
    this.users = new Map();
    this.logs = new Map();
    this.currentUserId = 1;
    this.currentLogId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const id = this.currentLogId++;
    const log: Log = {
      id,
      created_at: new Date(),
      ...insertLog,
    };
    this.logs.set(id, log);
    return log;
  }

  async getLogsByRunId(runId: string): Promise<Log[]> {
    return Array.from(this.logs.values())
      .filter((log) => log.run_id === runId)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
  }

  async getAllRuns(): Promise<{ run_id: string; start_time: Date; log_count: number; error_count: number }[]> {
    const runs = new Map<string, { start_time: Date; log_count: number; error_count: number }>();
    
    for (const log of this.logs.values()) {
      if (!runs.has(log.run_id)) {
        runs.set(log.run_id, {
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
      
      // Update start time if this log is earlier
      if (log.created_at < run.start_time) {
        run.start_time = log.created_at;
      }
    }

    return Array.from(runs.entries()).map(([run_id, data]) => ({
      run_id,
      ...data,
    })).sort((a, b) => b.start_time.getTime() - a.start_time.getTime());
  }

  async getRunStatistics(runId: string): Promise<{
    total: number;
    info: number;
    warn: number;
    error: number;
    start_time: Date;
  } | null> {
    const runLogs = await this.getLogsByRunId(runId);
    
    if (runLogs.length === 0) {
      return null;
    }

    const stats = {
      total: runLogs.length,
      info: 0,
      warn: 0,
      error: 0,
      start_time: runLogs[0].created_at,
    };

    for (const log of runLogs) {
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
    }

    return stats;
  }

  async searchLogs(runId: string, query?: string, levels?: string[]): Promise<Log[]> {
    let logs = await this.getLogsByRunId(runId);

    if (levels && levels.length > 0) {
      logs = logs.filter(log => levels.includes(log.level));
    }

    if (query) {
      const regex = new RegExp(query, 'i');
      logs = logs.filter(log => 
        regex.test(log.message) || 
        (log.data && regex.test(JSON.stringify(log.data)))
      );
    }

    return logs;
  }

  async clearLogs(runId: string): Promise<void> {
    const logsToDelete = Array.from(this.logs.entries())
      .filter(([_, log]) => log.run_id === runId)
      .map(([id]) => id);
    
    for (const id of logsToDelete) {
      this.logs.delete(id);
    }
  }
}

export const storage = new MemStorage();
