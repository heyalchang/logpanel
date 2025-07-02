import React, { createContext, useContext } from 'react';
import type { LogService } from '@logpanel/contract';
import { logService } from '@logpanel/service';

const LogServiceContext = createContext<LogService | null>(null);

export function LogServiceProvider({ children }: { children: React.ReactNode }) {
  return (
    <LogServiceContext.Provider value={logService}>
      {children}
    </LogServiceContext.Provider>
  );
}

export function useLogService() {
  const service = useContext(LogServiceContext);
  if (!service) {
    throw new Error('useLogService must be used within LogServiceProvider');
  }
  return service;
} 