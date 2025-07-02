import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Log, InsertLog } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

// Test database connection
export const useTestConnection = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('count', { count: 'exact', head: true });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (log: InsertLog) => {
      const { data, error } = await supabase
        .from('logs')
        .insert([log])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create log: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useRuns = () => {
  return useQuery({
    queryKey: ['runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('run_id, created_at, level')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by run_id and calculate stats
      const runs = new Map();
      data.forEach((log: any) => {
        if (!runs.has(log.run_id)) {
          runs.set(log.run_id, {
            run_id: log.run_id,
            start_time: log.created_at,
            log_count: 0,
            error_count: 0,
          });
        }
        const run = runs.get(log.run_id);
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
  });
};

export const useLogs = (runId: string | null, searchQuery?: string, levels?: string[]) => {
  return useQuery({
    queryKey: ['logs', runId, searchQuery, levels?.join(',')],
    enabled: !!runId,
    queryFn: async () => {
      if (!runId) return [];

      let query = supabase
        .from('logs')
        .select('*')
        .eq('run_id', runId)
        .order('created_at', { ascending: true });

      // Filter by levels if specified
      if (levels && levels.length > 0) {
        query = query.in('level', levels);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Apply search filter on client side for now
      let filteredData = data;
      if (searchQuery) {
        const regex = new RegExp(searchQuery, 'i');
        filteredData = data.filter((log: any) => 
          regex.test(log.message) || 
          (log.data && regex.test(JSON.stringify(log.data)))
        );
      }

      return filteredData as Log[];
    },
  });
};

export const useRunStatistics = (runId: string | null) => {
  return useQuery({
    queryKey: ['run-stats', runId],
    enabled: !!runId,
    refetchInterval: 1000,
    queryFn: async () => {
      if (!runId) return null;

      const { data, error } = await supabase
        .from('logs')
        .select('level, created_at')
        .eq('run_id', runId);

      if (error) throw error;
      if (data.length === 0) return null;

      const stats = {
        total: data.length,
        info: 0,
        warn: 0,
        error: 0,
        start_time: data[0].created_at,
      };

      data.forEach((log: any) => {
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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase
        .from('logs')
        .delete()
        .eq('run_id', runId);
      
      if (error) throw error;
    },
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createLog = useCreateLog();

  return useMutation({
    mutationFn: async (appType: string) => {
      const runId = `${appType}-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}`;
      
      const demoLogs = getDemoLogs(appType);
      const createdLogs = [];
      
      for (const template of demoLogs) {
        const log = await createLog.mutateAsync({
          level: template.level,
          message: template.message,
          data: template.data,
          run_id: runId,
        });
        createdLogs.push(log);
      }
      
      return { run_id: runId, logs: createdLogs };
    },
    onSuccess: (data) => {
      toast({
        title: "Demo Run Created",
        description: `Created ${data.logs.length} logs for run: ${data.run_id}`,
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