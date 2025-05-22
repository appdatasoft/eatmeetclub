
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSubmissionStorage } from '../membership/membership-submission/useSubmissionStorage';

describe('useSubmissionStorage hook', () => {
  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();
    vi.clearAllMocks();
  });
  
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useSubmissionStorage());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSubmitted).toBe(false);
  });
  
  it('should detect existing submission in progress from session storage', () => {
    // Set up session storage with existing checkout
    sessionStorage.setItem('checkout_initiated', 'true');
    
    const { result } = renderHook(() => useSubmissionStorage());
    
    expect(result.current.isSubmissionInProgress()).toBe(true);
  });
  
  it('should not detect submission in progress when storage is empty', () => {
    const { result } = renderHook(() => useSubmissionStorage());
    
    expect(result.current.isSubmissionInProgress()).toBe(false);
  });
  
  it('should mark checkout as initiated', () => {
    const { result } = renderHook(() => useSubmissionStorage());
    
    act(() => {
      result.current.markCheckoutInitiated();
    });
    
    expect(sessionStorage.getItem('checkout_initiated')).toBe('true');
    expect(result.current.isSubmitted).toBe(true);
    expect(result.current.isSubmissionInProgress()).toBe(true);
  });
  
  it('should update loading state', () => {
    const { result } = renderHook(() => useSubmissionStorage());
    
    act(() => {
      result.current.setIsLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSubmissionInProgress()).toBe(true);
    
    act(() => {
      result.current.setIsLoading(false);
    });
    
    // Should still be in progress if isSubmitted is true
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSubmissionInProgress()).toBe(false);
  });
});
