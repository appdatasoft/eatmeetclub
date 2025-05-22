
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventApproval } from '../useEventApproval';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

describe('useEventApproval hook', () => {
  const mockToast = vi.fn();
  const mockEventId = 'event-123';
  
  beforeEach(() => {
    vi.resetAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
  });
  
  it('should initialize with null approval status', () => {
    const { result } = renderHook(() => useEventApproval(mockEventId));
    
    expect(result.current.approvalStatus).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });
  
  it('should fetch approval status successfully', async () => {
    const mockApprovalData = {
      approval_status: 'pending',
      approval_date: null,
      rejection_reason: null
    };
    
    (supabase.single as any).mockResolvedValue({ data: mockApprovalData, error: null });
    
    const { result } = renderHook(() => useEventApproval(mockEventId));
    
    let status;
    await act(async () => {
      status = await result.current.fetchApprovalStatus();
    });
    
    expect(status).toBe('pending');
    expect(result.current.approvalStatus).toBe('pending');
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(supabase.select).toHaveBeenCalledWith('approval_status, approval_date, rejection_reason');
    expect(supabase.eq).toHaveBeenCalledWith('id', mockEventId);
  });
  
  it('should handle fetch errors gracefully', async () => {
    const mockError = new Error('Database error');
    (supabase.single as any).mockResolvedValue({ data: null, error: mockError });
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { result } = renderHook(() => useEventApproval(mockEventId));
    
    let status;
    await act(async () => {
      status = await result.current.fetchApprovalStatus();
    });
    
    expect(status).toBeNull();
    expect(result.current.approvalStatus).toBeNull();
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it('should submit event for approval', async () => {
    (supabase.eq as any).mockResolvedValue({ error: null });
    
    const { result } = renderHook(() => useEventApproval(mockEventId));
    
    let success;
    await act(async () => {
      success = await result.current.submitForApproval();
    });
    
    expect(success).toBe(true);
    expect(result.current.approvalStatus).toBe('pending');
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
      approval_status: 'pending',
      submitted_for_approval_at: expect.any(String)
    }));
    expect(supabase.eq).toHaveBeenCalledWith('id', mockEventId);
    
    // Should show success toast
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Event Submitted"
    }));
  });
  
  it('should approve an event', async () => {
    const ownerId = 'owner-123';
    (supabase.eq as any).mockResolvedValue({ error: null });
    
    const { result } = renderHook(() => useEventApproval(mockEventId));
    
    let success;
    await act(async () => {
      success = await result.current.approveEvent(ownerId);
    });
    
    expect(success).toBe(true);
    expect(result.current.approvalStatus).toBe('approved');
    expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
      approval_status: 'approved',
      approval_date: expect.any(String),
      approved_by: ownerId
    }));
    
    // Should show success toast
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Event Approved"
    }));
  });
  
  it('should reject an event with reason', async () => {
    const ownerId = 'owner-123';
    const rejectReason = 'Does not meet venue requirements';
    (supabase.eq as any).mockResolvedValue({ error: null });
    
    const { result } = renderHook(() => useEventApproval(mockEventId));
    
    let success;
    await act(async () => {
      success = await result.current.rejectEvent(ownerId, rejectReason);
    });
    
    expect(success).toBe(true);
    expect(result.current.approvalStatus).toBe('rejected');
    expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
      approval_status: 'rejected',
      rejection_date: expect.any(String),
      rejected_by: ownerId,
      rejection_reason: rejectReason
    }));
    
    // Should show success toast
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Event Rejected"
    }));
  });
  
  it('should handle submission errors', async () => {
    const mockError = { message: 'Update failed' };
    (supabase.eq as any).mockResolvedValue({ error: mockError });
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { result } = renderHook(() => useEventApproval(mockEventId));
    
    let success;
    await act(async () => {
      success = await result.current.submitForApproval();
    });
    
    expect(success).toBe(false);
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Submission Failed",
      variant: "destructive"
    }));
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
