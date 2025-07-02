import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface DemoControlsProps {
  onRunCreated: () => void;
}

export default function DemoControls({ onRunCreated }: DemoControlsProps) {
  const { toast } = useToast();

  const createDemoRun = useMutation({
    mutationFn: async (appType: string) => {
      const response = await apiRequest('POST', `/api/demo/${appType}`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Demo Run Created",
        description: `Created ${data.logs.length} logs for run: ${data.run_id}`,
      });
      onRunCreated();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create demo run: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const demoApps = [
    {
      type: 'web-server',
      label: '🌐 Start Web Server Demo',
      className: 'bg-vscode-accent hover:bg-blue-600',
    },
    {
      type: 'api-service',
      label: '🔌 Start API Service Demo',
      className: 'bg-green-600 hover:bg-green-700',
    },
    {
      type: 'worker',
      label: '⚙️ Start Background Worker Demo',
      className: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="p-4 border-b border-vscode-border">
      <h3 className="text-sm font-semibold mb-3 text-vscode-text">Demo Applications</h3>
      <div className="space-y-2">
        {demoApps.map((app) => (
          <Button
            key={app.type}
            onClick={() => createDemoRun.mutate(app.type)}
            disabled={createDemoRun.isPending}
            className={`w-full text-white px-3 py-2 text-sm font-medium transition-colors ${app.className}`}
          >
            {createDemoRun.isPending ? 'Creating...' : app.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
