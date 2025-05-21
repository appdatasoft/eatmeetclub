
/// <reference types="vitest" />
import { render, screen } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import { RestaurantMenuPreview } from './RestaurantMenuPreview';
import { ThemeProvider } from '@/components/theme-provider';

// ✅ Declare the toastMock before use
const toastMock = {
  toast: vi.fn(),
};

// ✅ Mock useToast to return the toastMock
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => toastMock,
}));

// Helper function to render with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('RestaurantMenuPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton when loading', async () => {
    vi.doMock('@/hooks/restaurant/useRestaurant', () => ({
      useRestaurant: () => ({
        isLoading: true,
        isError: false,
        menuItems: [],
      }),
    }));

    const { container } = renderWithTheme(<RestaurantMenuPreview restaurantId="test-id" />);
    expect(container).toHaveTextContent(/loading/i);
  });

  it('renders empty state when no menu items are found', async () => {
    vi.doMock('@/hooks/restaurant/useRestaurant', () => ({
      useRestaurant: () => ({
        isLoading: false,
        isError: false,
        menuItems: [],
      }),
    }));

    renderWithTheme(<RestaurantMenuPreview restaurantId="test-id" />);
    expect(screen.getByText(/no menu items/i)).toBeInTheDocument();
  });

  it('renders menu list when items exist', async () => {
    vi.doMock('@/hooks/restaurant/useRestaurant', () => ({
      useRestaurant: () => ({
        isLoading: false,
        isError: false,
        menuItems: [
          {
            id: '1',
            title: 'Doro Wat',
            description: 'Spicy chicken stew',
            price: 15,
            media: [],
          },
        ],
      }),
    }));

    renderWithTheme(<RestaurantMenuPreview restaurantId="test-id" />);
    expect(screen.getByText(/doro wat/i)).toBeInTheDocument();
  });

  it('shows error toast if fetching menu fails', async () => {
    vi.doMock('@/hooks/restaurant/useRestaurant', () => ({
      useRestaurant: () => ({
        isLoading: false,
        isError: true,
        menuItems: [],
      }),
    }));

    renderWithTheme(<RestaurantMenuPreview restaurantId="test-id" />);

    expect(toastMock.toast).toHaveBeenCalledWith({
      title: 'Failed to load menu.',
      variant: 'destructive',
    });
  });
});
