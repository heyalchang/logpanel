import { useEffect, useState } from "react";

interface RunInfo {
  run_id: string;
  start_time: string;
  log_count: number;
  error_count: number;
}

interface LogRow {
  id: number;
  created_at: string;
  level: string;
  message: string;
}

export default function ServerTestPage() {
  const [runs, setRuns] = useState<RunInfo[]>([]);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch runs on mount or refresh
  const fetchRuns = async () => {
    try {
      setError(null);
      const res = await fetch("/api/runs");
      const data = await res.json();
      setRuns(data);
    } catch (e) {
      setError("Failed to load runs");
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  // fetch logs when run selected
  useEffect(() => {
    if (!selectedRun) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/logs/${selectedRun}`);
        const data = await res.json();
        setLogs(data);
      } catch (e) {
        setError("Failed to load logs");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedRun]);

  const generateDemo = async (type: string) => {
    setLoading(true);
    await fetch(`/api/demo/${type}`, { method: "POST" });
    await fetchRuns();
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Server-Only Test Page</h1>
      <p>
        Minimal page that talks directly to the Express API (no Supabase JS,
        no fancy styling).
      </p>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => generateDemo("web-server")}>Gen Web Demo</button>
        <button onClick={() => generateDemo("api-service")}>Gen API Demo</button>
        <button onClick={() => generateDemo("worker")}>Gen Worker Demo</button>
      </div>

      <h2>Runs</h2>
      {runs.length === 0 ? (
        <p>No runs yet.</p>
      ) : (
        <ul>
          {runs.map((r) => (
            <li key={r.run_id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedRun(r.run_id);
                }}
              >
                {r.run_id} ({r.log_count} logs, {r.error_count} errors)
              </a>
            </li>
          ))}
        </ul>
      )}

      {selectedRun && (
        <div>
          <h2>Logs for {selectedRun}</h2>
          {loading ? (
            <p>Loading…</p>
          ) : logs.length === 0 ? (
            <p>No logs.</p>
          ) : (
            <table border={1} cellPadding={4} style={{ fontFamily: "monospace" }}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Level</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td>{new Date(l.created_at).toLocaleTimeString()}</td>
                    <td>{l.level}</td>
                    <td>{l.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
} 