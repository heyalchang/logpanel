import type { LogLevel } from '@logpanel/schema';
import type { DemoType } from '@logpanel/contract';

interface LogTemplate {
  level: LogLevel;
  message: string;
  data?: unknown;
}

export function getDemoLogs(appType: DemoType): LogTemplate[] {
  const demoTemplates: Record<DemoType, LogTemplate[]> = {
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
    ],
    'mobile-app': [
      { level: 'INFO', message: 'App launched on iOS', data: { platform: 'iOS', version: '1.4.2', device: 'iPhone 15 Pro' }},
      { level: 'INFO', message: 'User signed in', data: { user_id: 'user_987', auth_method: 'oauth_google' }},
      { level: 'INFO', message: 'Fetching feed items', data: { endpoint: '/v1/feed', network: 'wifi' }},
      { level: 'WARN', message: 'Slow image download', data: { url: 'https://cdn.example.com/img/abc.jpg', duration_ms: 2200 }},
      { level: 'INFO', message: 'Push notification received', data: { notification_id: 'notif_123', action: 'open_article' }},
      { level: 'ERROR', message: 'Unhandled exception in reducer', data: { error: 'TypeError: undefined is not an object', screen: 'Home' }},
      { level: 'INFO', message: 'Crashlytics report sent', data: { report_id: 'crash_456', size_kb: 78 }},
      { level: 'INFO', message: 'In-app purchase completed', data: { sku: 'pro_upgrade', price: 4.99, currency: 'USD' }},
      { level: 'INFO', message: 'WebSocket connected', data: { uri: 'wss://realtime.example.com', ping_ms: 36 }},
      { level: 'WARN', message: 'Battery level low', data: { level: 15, is_charging: false }},
      { level: 'INFO', message: 'Background fetch finished', data: { task: 'sync_offline_data', records_synced: 42 }},
      { level: 'INFO', message: 'App moved to background', data: { timestamp: new Date().toISOString() }},
    ],
    'iot-device': [
      { level: 'INFO', message: 'Sensor node boot sequence started', data: { firmware: '3.2.0', node_id: 'sensor-21' }},
      { level: 'INFO', message: 'GPS lock acquired', data: { sats: 7, latitude: 37.7749, longitude: -122.4194 }},
      { level: 'WARN', message: 'Temperature nearing threshold', data: { value_c: 68, threshold_c: 70 }},
      { level: 'INFO', message: 'MQTT message published', data: { topic: 'devices/21/telemetry', payload_bytes: 128 }},
      { level: 'ERROR', message: 'LoRaWAN transmission failed', data: { error: 'timeout', retries: 3 }},
      { level: 'INFO', message: 'Reboot scheduled after update', data: { update_id: 'fw_774', eta_sec: 45 }},
      { level: 'INFO', message: 'Battery voltage reported', data: { voltage_mv: 3710, percentage: 82 }},
      { level: 'WARN', message: 'Packet loss high', data: { loss_pct: 12, window_sec: 300 }},
      { level: 'INFO', message: 'OTA update downloaded', data: { bytes: 1048576, duration_ms: 52000 }},
      { level: 'INFO', message: 'Diagnostics heartbeat sent', data: { seq: 1523, uptime_sec: 86400 }},
      { level: 'INFO', message: 'Entered deep sleep', data: { expected_wake_ms: 900000 }},
      { level: 'INFO', message: 'Woke from sleep', data: { reason: 'timer', rssi_dbm: -72 }},
    ]
  };

  const templates = demoTemplates[appType];
  
  // Generate 25 logs by repeating and varying the templates
  const logs: LogTemplate[] = [];
  for (let i = 0; i < 25; i++) {
    const template = templates[i % templates.length];
    logs.push({
      ...template,
      message: i >= templates.length ? `${template.message} (iteration ${Math.floor(i / templates.length) + 1})` : template.message
    });
  }
  
  return logs;
} 