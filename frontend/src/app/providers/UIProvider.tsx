import * as React from 'react';

// HeroUI removed — MUI ThemeProvider is in App.tsx
export function UIProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
