
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRestaurantDialogs } from '@/components/dashboard/restaurants/useRestaurantDialogs';

describe('useRestaurantDialogs hook', () => {
  const mockRestaurant = {
    id: 'rest-123',
    name: 'Test Restaurant',
    user_id: 'user-123',
    cuisine_type: 'Italian',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipcode: '12345',
    phone: '555-1234',
    website: 'test.com'
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRestaurantDialogs());
    
    // Initial state check
    expect(result.current.editRestaurant).toBeNull();
    expect(result.current.isEditDialogOpen).toBe(false);
    expect(result.current.deleteRestaurant).toBeNull();
    expect(result.current.isDeleteDialogOpen).toBe(false);
  });

  it('should open edit dialog correctly', () => {
    const { result } = renderHook(() => useRestaurantDialogs());
    
    act(() => {
      result.current.openEditDialog(mockRestaurant);
    });
    
    // Check state after opening edit dialog
    expect(result.current.editRestaurant).toEqual(mockRestaurant);
    expect(result.current.isEditDialogOpen).toBe(true);
  });

  it('should open delete dialog correctly', () => {
    const { result } = renderHook(() => useRestaurantDialogs());
    const restaurantId = 'rest-123';
    const restaurantName = 'Test Restaurant';
    
    act(() => {
      result.current.openDeleteDialog(restaurantId, restaurantName);
    });
    
    // Check state after opening delete dialog
    expect(result.current.deleteRestaurant).toEqual({ id: restaurantId, name: restaurantName });
    expect(result.current.isDeleteDialogOpen).toBe(true);
  });

  it('should close edit dialog correctly', () => {
    const { result } = renderHook(() => useRestaurantDialogs());
    
    // First open the dialog
    act(() => {
      result.current.openEditDialog(mockRestaurant);
    });
    
    // Then close it
    act(() => {
      result.current.setIsEditDialogOpen(false);
    });
    
    // Verify dialog is closed
    expect(result.current.isEditDialogOpen).toBe(false);
    // Restaurant data should remain until explicitly cleared
    expect(result.current.editRestaurant).toEqual(mockRestaurant);
  });

  it('should close delete dialog correctly', () => {
    const { result } = renderHook(() => useRestaurantDialogs());
    
    // First open the dialog
    act(() => {
      result.current.openDeleteDialog('rest-123', 'Test Restaurant');
    });
    
    // Then close it
    act(() => {
      result.current.setIsDeleteDialogOpen(false);
    });
    
    // Verify dialog is closed
    expect(result.current.isDeleteDialogOpen).toBe(false);
    // Restaurant data should remain until explicitly cleared
    expect(result.current.deleteRestaurant).toEqual({ id: 'rest-123', name: 'Test Restaurant' });
  });
});
