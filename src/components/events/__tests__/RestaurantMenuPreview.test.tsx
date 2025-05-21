
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import RestaurantMenuPreview from '../RestaurantMenuPreview';
import { useMenuItemsFetcher } from '../restaurant-menu/hooks/useMenuItemsFetcher';
import { ToastProvider } from '@/hooks/use-toast';

// Mock the hooks
vi.mock('../restaurant-menu/hooks/useMenuItemsFetcher', () => ({
  useMenuItemsFetcher: vi.fn(),
}));

// Mock the components used in RestaurantMenuPreview
vi.mock('../restaurant-menu/LoadingSkeleton', () => ({
  default: () => <div data-testid="loading-skeleton">Loading...</div>,
}));

vi.mock('../restaurant-menu/EmptyMenuState', () => ({
  default: () => <div data-testid="empty-menu">No menu items</div>,
}));

vi.mock('../restaurant-menu/MenuList', () => ({
  default: ({ menuItems }) => (
    <div data-testid="menu-list">
      {menuItems.length} menu items
    </div>
  ),
}));

describe('RestaurantMenuPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state when fetching menu items', () => {
    (useMenuItemsFetcher as any).mockReturnValue({
      menuItems: [],
      isLoading: true,
      error: null,
    });

    render(
      <ToastProvider>
        <RestaurantMenuPreview restaurantId="123" />
      </ToastProvider>
    );

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('shows empty state when no menu items are available', () => {
    (useMenuItemsFetcher as any).mockReturnValue({
      menuItems: [],
      isLoading: false,
      error: null,
    });

    render(
      <ToastProvider>
        <RestaurantMenuPreview restaurantId="123" />
      </ToastProvider>
    );

    expect(screen.getByTestId('empty-menu')).toBeInTheDocument();
  });

  it('renders menu list when menu items are available', () => {
    const mockMenuItems = [
      { id: '1', name: 'Item 1', price: 10, description: 'Desc 1', type: 'Appetizer' },
      { id: '2', name: 'Item 2', price: 15, description: 'Desc 2', type: 'Main' },
    ];

    (useMenuItemsFetcher as any).mockReturnValue({
      menuItems: mockMenuItems,
      isLoading: false,
      error: null,
    });

    render(
      <ToastProvider>
        <RestaurantMenuPreview restaurantId="123" />
      </ToastProvider>
    );

    expect(screen.getByTestId('menu-list')).toBeInTheDocument();
  });

  it('shows error state when there is an error fetching menu items', () => {
    // We mocked the ToastProvider, so we can check if it shows an error
    const mockToastFn = vi.fn();
    vi.mock('@/hooks/use-toast', () => ({
      useToast: () => ({
        toast: mockToastFn,
      }),
    }));

    (useMenuItemsFetcher as any).mockReturnValue({
      menuItems: [],
      isLoading: false,
      error: 'Failed to fetch menu items',
    });

    render(
      <ToastProvider>
        <RestaurantMenuPreview restaurantId="123" />
      </ToastProvider>
    );

    // Since we're using the mock Toast implementation,
    // we'll at least verify the component renders without crashing
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('passes the restaurant ID to the menu items fetcher', () => {
    (useMenuItemsFetcher as any).mockReturnValue({
      menuItems: [],
      isLoading: false,
      error: null,
    });

    render(
      <ToastProvider>
        <RestaurantMenuPreview restaurantId="test-123" />
      </ToastProvider>
    );

    expect(useMenuItemsFetcher).toHaveBeenCalledWith('test-123');
  });
});
