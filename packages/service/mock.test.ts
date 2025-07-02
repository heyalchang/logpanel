import { mockLogService } from './mock';

describe('mockLogService', () => {
  beforeEach(() => {
    // Clear any existing data by getting all runs and clearing them
    mockLogService.getRuns().then(runs => {
      runs.forEach(run => {
        mockLogService.clearRun(run.run_id);
      });
    });
  });

  test('createDemoRun creates logs', async () => {
    const runId = await mockLogService.createDemoRun('web-server');
    
    expect(runId).toMatch(/^web-server-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
    
    const logs = await mockLogService.getLogs(runId);
    expect(logs.length).toBe(25);
    expect(logs[0].run_id).toBe(runId);
  });

  test('getRuns returns run metadata', async () => {
    await mockLogService.createDemoRun('api-service');
    await mockLogService.createDemoRun('worker');
    
    const runs = await mockLogService.getRuns();
    expect(runs.length).toBe(2);
    expect(runs[0].log_count).toBe(25);
    expect(runs[0].error_count).toBeGreaterThan(0);
  });

  test('getLogs filters by level', async () => {
    const runId = await mockLogService.createDemoRun('web-server');
    
    const errorLogs = await mockLogService.getLogs(runId, { levels: ['ERROR'] });
    expect(errorLogs.every(log => log.level === 'ERROR')).toBe(true);
    expect(errorLogs.length).toBeGreaterThan(0);
  });

  test('getLogs filters by search', async () => {
    const runId = await mockLogService.createDemoRun('web-server');
    
    const searchLogs = await mockLogService.getLogs(runId, { search: 'database' });
    expect(searchLogs.length).toBeGreaterThan(0);
    expect(searchLogs.some(log => log.message.toLowerCase().includes('database'))).toBe(true);
  });

  test('clearRun removes logs', async () => {
    const runId = await mockLogService.createDemoRun('iot-device');
    
    let logs = await mockLogService.getLogs(runId);
    expect(logs.length).toBe(25);
    
    await mockLogService.clearRun(runId);
    
    logs = await mockLogService.getLogs(runId);
    expect(logs.length).toBe(0);
  });
}); 