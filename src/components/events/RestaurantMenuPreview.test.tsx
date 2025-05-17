
import React from 'react';
import { render, screen, waitFor } from '@/lib/test-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RestaurantMenuPreview from './RestaurantMenuPreview';
import { useMenuItemsFetcher } from './restaurant-menu/hooks/useMenuItemsFetcher';

// Mock the hook
vi.mock('./restaurant-menu/hooks/useMenuItemsFetcher', () => ({
  useMenuItemsFetcher: vi.fn()
}));

// Mock the toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock the components
vi.mock('./restaurant-menu/LoadingSkeleton', () => ({
  default: () => <div data-testid="loading-skeleton">Loading...</div>
}));

vi.mock('./restaurant-menu/EmptyMenuState', () => ({
  default: () => <div data-testid="empty-menu-state">No menu items</div>
}));

vi.mock('./restaurant-menu/MenuList', () => ({
  default: ({ menuItems }) => (
    <div data-testid="menu-list">
      {menuItems.length} items found
    </div>
  )
}));

describe('RestaurantMenuPreview Component', () => {
  const mockRestaurantId = 'restaurant-123';
  const mockMenuItems = [
    { id: '1', name: 'Item 1', price: 9.99, type: 'Main' },
    { id: '2', name: 'Item 2', price: 12.99, type: 'Dessert' }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading skeleton when loading', () => {
    (useMenuItemsFetcher as any).mockReturnValue({
      menuItems: [],
      isLoading: true,
      error: null
    });

    render(<RestaurantMenuPreview restaurantId={mockRestaurantId} />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders empty state when no menu items are found', () => {
    (useMenuItemsFetcher as any).mockReturnValue({
      menuItems: [],
      isLoading: false,
      error: null
    });

    render(<RestaurantMenuPreview restaurantId={mockRestaurantId} />);
    
    expect(screen.getByTestId('empty-menu-state')).toBeInTheDocument();
  });

  it('renders menu list when menu items are available', () => {
    (useMenuItemsFetcher as any).mockReturnValue({
      menuItems: mockMenuItems,
      isLoading: false,
      error: null
    });

    render(<RestaurantMenuPreview restaurantId={mockRestaurantId} />);
    
    expect(screen.getByTestId('menu-list')).toBeInTheDocument();
    expect(screen.getByText('2 items found')).toBeInTheDocument();
  });

  it('shows error toast when there is an error', async () => {
    (useMenuItemsFetcher as any).mockReturnValue({
      menuItems: [],
      isLoading: false,
      error: 'Failed to load menu items'
    });

    const toastMock = vi.fn();
    vi.mock('@/hooks/use-toast', () => ({
      useToast: () => ({
        toast: toastMock
      })
    }));

    render(<RestaurantMenuPreview restaurantId={mockRestaurantId} />);
    
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalled();
    });
  });
});
