import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateDemoRun } from "@/hooks/use-supabase-logs";

export default function FloatingTestPanel() {
  const createDemoRun = useCreateDemoRun();
  const [open, setOpen] = useState(true);

  const scenarios = [
    { type: "web-server", label: "Web Server" },
    { type: "api-service", label: "API Service" },
    { type: "worker", label: "Worker" },
    { type: "mobile-app", label: "Mobile App" },
    { type: "iot-device", label: "IoT Device" },
  ];

  if (!open) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          ⚙️ Test Data
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-48 bg-vscode-panel border border-vscode-border rounded shadow-lg p-3 space-y-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-vscode-muted">Generate Logs</span>
        <button
          className="text-vscode-muted text-xs hover:text-vscode-text"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      {scenarios.map((s) => (
        <Button
          key={s.type}
          size="sm"
          className="w-full"
          disabled={createDemoRun.isPending}
          onClick={() => createDemoRun.mutate(s.type)}
        >
          {createDemoRun.isPending ? "Creating…" : s.label}
        </Button>
      ))}
    </div>
  );
} 