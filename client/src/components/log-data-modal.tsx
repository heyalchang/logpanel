import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Log } from "@shared/schema";

interface LogDataModalProps {
  log: Log | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LogDataModal({ log, isOpen, onClose }: LogDataModalProps) {
  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-vscode-panel border-vscode-border max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader className="border-b border-vscode-border pb-4">
          <DialogTitle className="text-lg font-semibold text-vscode-text">
            Log Entry Data
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <pre className="text-sm font-mono bg-vscode-bg p-4 rounded border border-vscode-border text-vscode-text whitespace-pre-wrap">
            <code>
              {JSON.stringify(
                {
                  id: log.id,
                  created_at: log.created_at,
                  level: log.level,
                  message: log.message,
                  data: log.data,
                  run_id: log.run_id,
                },
                null,
                2
              )}
            </code>
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
