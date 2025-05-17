
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMenuItemsFetcher } from './useMenuItemsFetcher';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis()
  }
}));

// Mock the media utility functions
vi.mock('../utils/mediaUtils', () => ({
  fetchMenuItemMedia: vi.fn().mockResolvedValue([]),
  fetchMenuItemIngredients: vi.fn().mockResolvedValue([])
}));

describe('useMenuItemsFetcher Hook', () => {
  const mockRestaurantId = 'restaurant-123';
  const mockMenuItems = [
    {
      id: '1',
      name: 'Test Item',
      description: 'Test description',
      price: 9.99,
      type: 'Main',
      restaurant_id: mockRestaurantId
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns loading state initially', () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis()
    });

    const { result } = renderHook(() => useMenuItemsFetcher(mockRestaurantId));
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.menuItems).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('returns menu items when fetch is successful', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnValue(Promise.resolve({
        data: mockMenuItems,
        error: null
      }))
    });

    const { result } = renderHook(() => useMenuItemsFetcher(mockRestaurantId));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.menuItems.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it('returns error when fetch fails', async () => {
    const mockError = new Error('Failed to fetch menu items');
    
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnValue(Promise.resolve({
        data: null,
        error: mockError
      }))
    });

    const { result } = renderHook(() => useMenuItemsFetcher(mockRestaurantId));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.error).not.toBeNull();
    expect(result.current.menuItems).toEqual([]);
  });
});
