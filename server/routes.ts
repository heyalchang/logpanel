import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new log entry
  app.post("/api/logs", async (req, res) => {
    try {
      const logData = insertLogSchema.parse(req.body);
      const log = await storage.createLog(logData);
      res.json(log);
    } catch (error) {
      res.status(400).json({ message: "Invalid log data", error });
    }
  });

  // Get logs for a specific run
  app.get("/api/logs/:runId", async (req, res) => {
    try {
      const { runId } = req.params;
      const { query, levels } = req.query;
      
      const levelArray = levels ? (levels as string).split(',') : undefined;
      const logs = await storage.searchLogs(runId, query as string, levelArray);
      
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs", error });
    }
  });

  // Get all runs
  app.get("/api/runs", async (req, res) => {
    try {
      const runs = await storage.getAllRuns();
      res.json(runs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch runs", error });
    }
  });

  // Get statistics for a specific run
  app.get("/api/runs/:runId/stats", async (req, res) => {
    try {
      const { runId } = req.params;
      const stats = await storage.getRunStatistics(runId);
      
      if (!stats) {
        return res.status(404).json({ message: "Run not found" });
      }
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch run statistics", error });
    }
  });

  // Clear logs for a specific run
  app.delete("/api/logs/:runId", async (req, res) => {
    try {
      const { runId } = req.params;
      await storage.clearLogs(runId);
      res.json({ message: "Logs cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear logs", error });
    }
  });

  // Generate demo logs for a run
  app.post("/api/demo/:appType", async (req, res) => {
    try {
      const { appType } = req.params;
      const runId = `${appType}-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}`;
      
      const demoLogs = getDemoLogs(appType);
      const createdLogs = [];
      
      for (const template of demoLogs) {
        const log = await storage.createLog({
          level: template.level,
          message: template.message,
          data: template.data,
          run_id: runId,
        });
        createdLogs.push(log);
      }
      
      res.json({ run_id: runId, logs: createdLogs });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate demo logs", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getDemoLogs(appType: string) {
  const demoTemplates = {
    'web-server': [
      { level: 'INFO', message: 'Server started successfully on port 3000', data: { port: 3000, environment: 'development' }},
      { level: 'INFO', message: 'Database connection established', data: { host: 'localhost', database: 'app_dev' }},
      { level: 'INFO', message: 'Loading middleware: cors, bodyParser, compression', data: { middleware: ['cors', 'bodyParser', 'compression'] }},
      { level: 'INFO', message: 'Routes registered: /api/users, /api/auth, /api/logs', data: { routes: ['/api/users', '/api/auth', '/api/logs'] }},
      { level: 'WARN', message: 'Rate limit approaching for IP 192.168.1.100', data: { ip: '192.168.1.100', requests: 95, limit: 100 }},
      { level: 'INFO', message: 'GET /api/users - 200 OK (45ms)', data: { method: 'GET', path: '/api/users', status: 200, duration: 45 }},
      { level: 'INFO', message: 'POST /api/auth/login - 200 OK (123ms)', data: { method: 'POST', path: '/api/auth/login', status: 200, duration: 123 }},
      { level: 'ERROR', message: 'Database query timeout: SELECT * FROM users WHERE...', data: { query: 'SELECT * FROM users WHERE active = true', timeout: 30000 }},
      { level: 'INFO', message: 'Cache miss for key: user_session_abc123', data: { key: 'user_session_abc123', ttl: 3600 }},
      { level: 'INFO', message: 'WebSocket connection established from 192.168.1.45', data: { ip: '192.168.1.45', connection_id: 'ws_12345' }},
      { level: 'WARN', message: 'Memory usage high: 87% of allocated heap', data: { memory_usage: 87, heap_total: '512MB', heap_used: '445MB' }},
      { level: 'INFO', message: 'Background job scheduled: email_cleanup_task', data: { job_type: 'email_cleanup_task', scheduled_at: new Date().toISOString() }},
    ],
    'api-service': [
      { level: 'INFO', message: 'API Gateway starting up', data: { version: '2.1.0', node_version: 'v18.17.0' }},
      { level: 'INFO', message: 'Loading service configurations', data: { services: ['auth', 'users', 'billing'] }},
      { level: 'INFO', message: 'Health check endpoints registered', data: { endpoints: ['/health', '/metrics', '/status'] }},
      { level: 'INFO', message: 'JWT verification middleware loaded', data: { algorithm: 'RS256', issuer: 'api.example.com' }},
      { level: 'INFO', message: 'Rate limiting configured: 1000 req/min', data: { limit: 1000, window: 60000 }},
      { level: 'WARN', message: 'Service discovery timeout for billing-service', data: { service: 'billing-service', timeout: 5000 }},
      { level: 'INFO', message: 'Circuit breaker opened for slow service', data: { service: 'external-api', threshold: 50 }},
      { level: 'ERROR', message: 'Authentication failed: Invalid token signature', data: { token_prefix: 'eyJ0eXAi...', error: 'invalid_signature' }},
      { level: 'INFO', message: 'Processing API request: GET /api/users', data: { method: 'GET', endpoint: '/api/users', user_id: 'user_123' }},
      { level: 'INFO', message: 'Response sent: 200 OK', data: { status: 200, response_time: 42 }},
      { level: 'WARN', message: 'Slow query detected: 2.5s', data: { query_time: 2500, threshold: 1000 }},
      { level: 'INFO', message: 'Cache hit for user profile', data: { cache_key: 'user_profile_123', hit_rate: 0.85 }},
    ],
    'worker': [
      { level: 'INFO', message: 'Background worker process started', data: { worker_id: 'worker_001', queue: 'default' }},
      { level: 'INFO', message: 'Connecting to Redis queue', data: { host: 'redis://localhost:6379', db: 0 }},
      { level: 'INFO', message: 'Job handlers registered', data: { handlers: ['email_send', 'image_resize', 'data_export'] }},
      { level: 'INFO', message: 'Processing job: email_send', data: { job_id: 'job_12345', type: 'email_send', attempts: 1 }},
      { level: 'WARN', message: 'Job retry attempt 2/3', data: { job_id: 'job_12340', error: 'SMTP connection failed' }},
      { level: 'INFO', message: 'Job completed successfully', data: { job_id: 'job_12345', duration: 1247 }},
      { level: 'ERROR', message: 'Job failed after max retries', data: { job_id: 'job_12340', attempts: 3, final_error: 'Network timeout' }},
      { level: 'INFO', message: 'Worker idle, waiting for jobs', data: { queue_size: 0, worker_state: 'idle' }},
      { level: 'INFO', message: 'Processing image resize job', data: { job_id: 'job_12346', original_size: '2048x1536', target_size: '800x600' }},
      { level: 'INFO', message: 'Data export job started', data: { job_id: 'job_12347', export_type: 'csv', record_count: 1500 }},
      { level: 'WARN', message: 'Queue size growing: 25 pending jobs', data: { queue_size: 25, threshold: 20 }},
      { level: 'INFO', message: 'Batch job completed: 50 emails sent', data: { batch_id: 'batch_001', success_count: 48, failed_count: 2 }},
    ]
  };

  const templates = demoTemplates[appType as keyof typeof demoTemplates] || demoTemplates['web-server'];
  
  // Generate 25 logs by repeating and varying the templates
  const logs = [];
  for (let i = 0; i < 25; i++) {
    const template = templates[i % templates.length];
    logs.push({
      ...template,
      message: i >= templates.length ? `${template.message} (iteration ${Math.floor(i / templates.length) + 1})` : template.message
    });
  }
  
  return logs;
}
