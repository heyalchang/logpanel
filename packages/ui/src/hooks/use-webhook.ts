import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Log } from '@shared/schema';

const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

export function useSendWebhook() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (logs: Log[]) => {
      if (!webhookUrl) {
        throw new Error('N8N_WEBHOOK_URL not configured');
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
    },
    onSuccess: () => {
      const { dismiss } = toast({
        title: 'Webhook Success',
        description: 'Logs sent to n8n',
      });
      setTimeout(() => dismiss(), 7000);
    },
    onError: (err: any) => {
      const { dismiss } = toast({
        title: 'Webhook Failed',
        description: err?.message || 'Unknown error',
        variant: 'destructive',
      });
      setTimeout(() => dismiss(), 7000);
    },
  });
}
