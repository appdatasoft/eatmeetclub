import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MenuSelectionModal from '../MenuSelectionModal';

// Mock the components and hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-123' } })
}));

vi.mock('../useMenuSelections', () => ({
  useMenuSelections: () => ({
    menuItems: [],
    selectedItems: [],
    loading: false,
    saving: false,
    toggleSelection: vi.fn(),
    handleSave: vi.fn()
  })
}));

vi.mock('../MenuSelectionHeader', () => ({
  default: () => <div data-testid="menu-header">Menu Selection Header</div>
}));

vi.mock('../MenuItemsList', () => ({
  default: () => <div data-testid="menu-items">Menu Items List</div>
}));

vi.mock('../MenuSelectionFooter', () => ({
  default: () => <div data-testid="menu-footer">Menu Selection Footer</div>
}));

describe('MenuSelectionModal', () => {
  it('renders all components when open', () => {
    render(
      <MenuSelectionModal 
        eventId="123"
        restaurantId="456"
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    
    expect(screen.getByTestId('menu-header')).toBeInTheDocument();
    expect(screen.getByTestId('menu-items')).toBeInTheDocument();
    expect(screen.getByTestId('menu-footer')).toBeInTheDocument();
  });
  
  // More detailed tests would require mocking Dialog from shadcn/ui which is complex
  // For a complete test, we'd need to test interaction between components
});
