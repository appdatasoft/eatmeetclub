
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useEventPaymentHandler } from '../useEventPaymentHandler';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { createMockEvent, createMockLocalStorage } from './test-utils';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn()
    },
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('useEventPaymentHandler initialization', () => {
  const mockEvent = createMockEvent();
  const mockToast = { toast: vi.fn() };
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue(mockToast);
    (useNavigate as any).mockReturnValue(mockNavigate);
    Object.defineProperty(window, 'localStorage', {
      value: createMockLocalStorage()
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEventPaymentHandler(mockEvent));
    
    expect(result.current.isPaymentProcessing).toBe(false);
    expect(typeof result.current.handleBuyTickets).toBe('function');
  });

  it('should show error toast when event is null', async () => {
    const { result } = renderHook(() => useEventPaymentHandler(null));
    
    await result.current.handleBuyTickets(2);
    
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Event details not available',
      variant: 'destructive'
    });
  });
});
