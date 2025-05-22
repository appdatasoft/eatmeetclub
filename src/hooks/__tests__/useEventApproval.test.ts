
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventApproval } from '../useEventApproval';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies with proper chaining methods
vi.mock('@/integrations/supabase/client', () => {
  // Create a mock function for the single method
  const mockSingle = vi.fn();
  // Create a mock function for the eq method that returns an object with the single method
  const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
  // Create a mock function for the select method that returns an object with the eq method
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
  // Create a mock function for the update method that returns an object with the eq method
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
  // Create a mock function for the from method that returns an object with the select and update methods
  const mockFrom = vi.fn().mockReturnValue({
    select: mockSelect,
    update: mockUpdate
  });

  return {
    supabase: {
      from: mockFrom
    }
  };
});

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
    
    // Set up the mock implementation for the single method
    (supabase.from('').select('').eq('', '').single as any).mockResolvedValue({ 
      data: mockApprovalData, 
      error: null 
    });
    
    const { result } = renderHook(() => useEventApproval(mockEventId));
    
    let status;
    await act(async () => {
      status = await result.current.fetchApprovalStatus();
    });
    
    expect(status).toBe('pending');
    expect(result.current.approvalStatus).toBe('pending');
    expect(supabase.from).toHaveBeenCalledWith('events');
  });
  
  it('should handle fetch errors gracefully', async () => {
    const mockError = new Error('Database error');
    
    // Set up the mock implementation for the single method
    (supabase.from('').select('').eq('', '').single as any).mockResolvedValue({ 
      data: null, 
      error: mockError 
    });
    
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
    // Set up the mock implementation for the eq method after update
    (supabase.from('').update({}).eq('', '') as any).mockResolvedValue({ 
      error: null 
    });
    
    const { result } = renderHook(() => useEventApproval(mockEventId));
    
    let success;
    await act(async () => {
      success = await result.current.submitForApproval();
    });
    
    expect(success).toBe(true);
    expect(result.current.approvalStatus).toBe('pending');
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(supabase.from('').update).toHaveBeenCalledWith(expect.objectContaining({
      approval_status: 'pending',
      submitted_for_approval_at: expect.any(String)
    }));
    
    // Should show success toast
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Event Submitted"
    }));
  });
  
  it('should approve an event', async () => {
    const ownerId = 'owner-123';
    
    // Set up the mock implementation for the eq method after update
    (supabase.from('').update({}).eq('', '') as any).mockResolvedValue({ 
      error: null 
    });
    
    const { result } = renderHook(() => useEventApproval(mockEventId));
    
    let success;
    await act(async () => {
      success = await result.current.approveEvent(ownerId);
    });
    
    expect(success).toBe(true);
    expect(result.current.approvalStatus).toBe('approved');
    expect(supabase.from('').update).toHaveBeenCalledWith(expect.objectContaining({
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
    
    // Set up the mock implementation for the eq method after update
    (supabase.from('').update({}).eq('', '') as any).mockResolvedValue({ 
      error: null 
    });
    
    const { result } = renderHook(() => useEventApproval(mockEventId));
    
    let success;
    await act(async () => {
      success = await result.current.rejectEvent(ownerId, rejectReason);
    });
    
    expect(success).toBe(true);
    expect(result.current.approvalStatus).toBe('rejected');
    expect(supabase.from('').update).toHaveBeenCalledWith(expect.objectContaining({
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
    
    // Set up the mock implementation for the eq method after update
    (supabase.from('').update({}).eq('', '') as any).mockResolvedValue({ 
      error: mockError 
    });
    
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
