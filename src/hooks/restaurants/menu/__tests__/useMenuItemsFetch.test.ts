
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMenuItemsFetch } from '../useMenuItemsFetch';
import { useRestaurantFetch } from '../useRestaurantFetch';
import { useMenuItems } from '../useMenuItems';

// Mock dependencies
vi.mock('../useRestaurantFetch', () => ({
  useRestaurantFetch: vi.fn()
}));

vi.mock('../useMenuItems', () => ({
  useMenuItems: vi.fn()
}));

describe('useMenuItemsFetch hook', () => {
  const mockRestaurantId = 'restaurant-123';
  const mockRestaurant = { id: mockRestaurantId, name: 'Test Restaurant' };
  const mockMenuItems = [
    { id: 'item-1', name: 'Item 1', price: 10 },
    { id: 'item-2', name: 'Item 2', price: 15 }
  ];
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should combine restaurant and menu items data', () => {
    (useRestaurantFetch as any).mockReturnValue({
      restaurant: mockRestaurant,
      isLoading: false,
      isOwner: true,
      error: null
    });
    
    (useMenuItems as any).mockReturnValue({
      menuItems: mockMenuItems,
      setMenuItems: vi.fn(),
      isLoading: false,
      error: null,
      retryFetch: vi.fn()
    });
    
    const { result } = renderHook(() => useMenuItemsFetch(mockRestaurantId));
    
    expect(result.current.restaurant).toBe(mockRestaurant);
    expect(result.current.menuItems).toBe(mockMenuItems);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isOwner).toBe(true);
    expect(result.current.error).toBe(null);
  });
  
  it('should prioritize loading state from either hook', () => {
    (useRestaurantFetch as any).mockReturnValue({
      restaurant: null,
      isLoading: true,
      isOwner: false,
      error: null
    });
    
    (useMenuItems as any).mockReturnValue({
      menuItems: [],
      setMenuItems: vi.fn(),
      isLoading: false,
      error: null,
      retryFetch: vi.fn()
    });
    
    const { result } = renderHook(() => useMenuItemsFetch(mockRestaurantId));
    
    expect(result.current.isLoading).toBe(true);
  });
  
  it('should prioritize error state from either hook', () => {
    const mockError = new Error('Restaurant fetch error');
    
    (useRestaurantFetch as any).mockReturnValue({
      restaurant: null,
      isLoading: false,
      isOwner: false,
      error: mockError
    });
    
    (useMenuItems as any).mockReturnValue({
      menuItems: [],
      setMenuItems: vi.fn(),
      isLoading: false,
      error: null,
      retryFetch: vi.fn()
    });
    
    const { result } = renderHook(() => useMenuItemsFetch(mockRestaurantId));
    
    expect(result.current.error).toBe(mockError);
    
    // Test menu items error takes priority if restaurant has no error
    const mockMenuError = new Error('Menu items fetch error');
    
    (useRestaurantFetch as any).mockReturnValue({
      restaurant: mockRestaurant,
      isLoading: false,
      isOwner: true,
      error: null
    });
    
    (useMenuItems as any).mockReturnValue({
      menuItems: [],
      setMenuItems: vi.fn(),
      isLoading: false,
      error: mockMenuError,
      retryFetch: vi.fn()
    });
    
    const { result: newResult } = renderHook(() => useMenuItemsFetch(mockRestaurantId));
    
    expect(newResult.current.error).toBe(mockMenuError);
  });
  
  it('should pass through setMenuItems and retryFetch', () => {
    const mockSetMenuItems = vi.fn();
    const mockRetryFetch = vi.fn();
    
    (useRestaurantFetch as any).mockReturnValue({
      restaurant: mockRestaurant,
      isLoading: false,
      isOwner: true,
      error: null
    });
    
    (useMenuItems as any).mockReturnValue({
      menuItems: mockMenuItems,
      setMenuItems: mockSetMenuItems,
      isLoading: false,
      error: null,
      retryFetch: mockRetryFetch
    });
    
    const { result } = renderHook(() => useMenuItemsFetch(mockRestaurantId));
    
    expect(result.current.setMenuItems).toBe(mockSetMenuItems);
    expect(result.current.retryFetch).toBe(mockRetryFetch);
  });
});
