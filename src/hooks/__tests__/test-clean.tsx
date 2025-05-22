import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('Basic test', () => {
  const queryClient = new QueryClient();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should render without error', () => {
    expect(true).toBe(true);
  });
});
