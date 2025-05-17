
import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from "@/components/theme-provider";

// Create a custom render function that includes providers needed for components
export function renderWithProviders(ui: React.ReactElement, options = {}) {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          {children}
        </ThemeProvider>
      ),
      ...options,
    }),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
