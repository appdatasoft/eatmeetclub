
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMenuSelections } from '@/components/events/menu-selection/useMenuSelections';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

describe('useMenuSelections hook', () => {
  const mockEventId = 'event-123';
  const mockRestaurantId = 'restaurant-123';
  const mockUserId = 'user-123';
  const mockOnClose = vi.fn();
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
  });
  
  it('should initialize with correct default values', () => {
    // Mock fetch to return empty array
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(Promise.resolve({ data: [], error: null }))
    }));
    
    const { result } = renderHook(() => 
      useMenuSelections(mockEventId, mockRestaurantId, mockUserId, mockOnClose)
    );
    
    // Check initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.saving).toBe(false);
    expect(result.current.menuItems).toEqual([]);
    expect(result.current.selectedItems).toEqual([]);
  });
  
  it('should fetch menu items and user selections on mount', async () => {
    // Setup mock data
    const mockMenuItems = [
      { id: 'item-1', name: 'Item 1', description: 'Desc 1', price: 10 },
      { id: 'item-2', name: 'Item 2', description: 'Desc 2', price: 15 }
    ];
    
    const mockSelections = [
      { menu_item_id: 'item-1' }
    ];
    
    // Mock menu items fetch
    (supabase.from as any).mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(Promise.resolve({ 
        data: mockMenuItems, 
        error: null 
      }))
    }));
    
    // Mock selections fetch
    (supabase.from as any).mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnValue(Promise.resolve({
        data: mockSelections,
        error: null
      }))
    }));
    
    // Use a real AbortController for testing
    global.AbortController = vi.fn().mockImplementation(() => ({
      signal: {},
      abort: vi.fn()
    }));
    
    const { result } = renderHook(() => 
      useMenuSelections(mockEventId, mockRestaurantId, mockUserId, mockOnClose)
    );
    
    // Wait for state updates
    await vi.waitFor(() => {
      expect(result.current.menuItems).toEqual(mockMenuItems);
      expect(result.current.selectedItems).toEqual(['item-1']);
    });
  });
  
  it('should toggle selection correctly', () => {
    // Mock initial fetch
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(Promise.resolve({ data: [], error: null }))
    }));
    
    const { result } = renderHook(() => 
      useMenuSelections(mockEventId, mockRestaurantId, mockUserId, mockOnClose)
    );
    
    // Toggle selection for item-1
    act(() => {
      result.current.toggleSelection('item-1');
    });
    
    // Item should be selected
    expect(result.current.selectedItems).toEqual(['item-1']);
    
    // Toggle again to deselect
    act(() => {
      result.current.toggleSelection('item-1');
    });
    
    // Item should be deselected
    expect(result.current.selectedItems).toEqual([]);
  });
  
  it('should save selections and close dialog', async () => {
    // Mock initial fetch
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(Promise.resolve({ data: [], error: null }))
    }));
    
    // Mock supabase delete
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(Promise.resolve({ error: null }))
      })
    });
    
    // Mock supabase insert
    const mockInsert = vi.fn().mockReturnValue(
      Promise.resolve({ error: null })
    );
    
    (supabase.from as any).mockImplementationOnce(() => ({
      delete: mockDelete
    }));
    
    (supabase.from as any).mockImplementationOnce(() => ({
      insert: mockInsert
    }));
    
    const { result } = renderHook(() => 
      useMenuSelections(mockEventId, mockRestaurantId, mockUserId, mockOnClose)
    );
    
    // Select an item
    act(() => {
      result.current.toggleSelection('item-1');
    });
    
    // Save selections
    await act(async () => {
      await result.current.handleSave();
    });
    
    // Toast should be called with success message
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Selections Saved'
      })
    );
    
    // Close function should be called
    expect(mockOnClose).toHaveBeenCalled();
  });
});
