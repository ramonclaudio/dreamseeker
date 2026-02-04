import type { ReactNode } from 'react';

interface RevenueCatProviderProps {
  children: ReactNode;
}

export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  // RevenueCat not supported on web - passthrough
  return <>{children}</>;
}

export const useRevenueCat = () => ({ isConfigured: false });
