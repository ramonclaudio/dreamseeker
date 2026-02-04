interface RevenueCatProviderProps {
  children: React.ReactNode;
}

export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  return <>{children}</>;
}
