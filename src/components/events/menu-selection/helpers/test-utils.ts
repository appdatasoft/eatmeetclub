
import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';

/**
 * Helper function to wait for async operations in tests
 */
export const waitForAsync = async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
};

/**
 * Helper function to create mock Supabase responses
 */
export const createSupabaseMock = (data: any = null, error: any = null) => {
  return {
    data,
    error
  };
};

/**
 * Creates a mock for useToast hook
 */
export const createToastMock = () => {
  const toastMock = vi.fn();
  return { toast: toastMock, toastMock };
};

/**
 * Helper to quickly mock a hook with custom return value
 */
export function mockHook<T>(hookModule: any, hookName: string, returnValue: T) {
  vi.mock(hookModule, () => ({
    [hookName]: () => returnValue
  }));
}

/**
 * Helper to render a hook with retries for async updates
 */
export async function renderHookWithRetries<Result, Props>(
  callback: (props: Props) => Result,
  options?: { initialProps?: Props, maxRetries?: number }
) {
  const { initialProps, maxRetries = 3 } = options || {};
  const hookResult = renderHook(callback, { initialProps });
  
  let retries = 0;
  while (retries < maxRetries) {
    await waitForAsync();
    retries++;
  }
  
  return hookResult;
}
