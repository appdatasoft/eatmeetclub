
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SocialMediaTab from '../SocialMediaTab';
import { useSocialMedia } from '@/hooks/useSocialMedia';
import { useEditableContent } from '@/components/editor/EditableContentProvider';
import { toast } from '@/hooks/use-toast';

// Mock the hooks
vi.mock('@/hooks/useSocialMedia', () => ({
  useSocialMedia: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
  toast: vi.fn(),
}));

vi.mock('@/components/editor/EditableContentProvider', () => ({
  useEditableContent: vi.fn(),
}));

// Mock the connection details modal
vi.mock('../ConnectionDetailsModal', () => ({
  default: ({ isOpen, onClose }) => (
    <div data-testid="connection-modal" data-is-open={isOpen.toString()}>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('SocialMediaTab', () => {
  const mockConnections = [
    { 
      id: '1', 
      platform: 'Instagram', 
      is_connected: true,
      created_at: '2023-01-01', 
      meta_data: { limited_access: false } 
    },
    { 
      id: '2', 
      platform: 'Facebook', 
      is_connected: true,
      created_at: '2023-01-02', 
      meta_data: { limited_access: true } 
    },
  ];

  const mockUseSocialMedia = {
    connections: mockConnections,
    isLoading: false,
    oauthPending: false,
    error: null,
    fetchConnections: vi.fn(),
    connectSocialMedia: vi.fn(),
    getConnectionStatus: vi.fn(),
    disconnectSocialMedia: vi.fn(),
  };

  const mockUseEditableContent = {
    editModeEnabled: false,
    contentMap: {},
    isEditing: null,
    handleEdit: vi.fn(),
    handleSave: vi.fn(),
    handleCancel: vi.fn(),
    canEdit: false,
    toggleEditMode: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSocialMedia as any).mockReturnValue(mockUseSocialMedia);
    (useEditableContent as any).mockReturnValue(mockUseEditableContent);
  });

  it('renders the component with connections', () => {
    render(
      <SocialMediaTab />
    );

    // Check that main card title is rendered
    expect(screen.getByText('Social Media Accounts')).toBeInTheDocument();
    
    // Check that Instagram and Facebook sections are rendered
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Facebook Page')).toBeInTheDocument();
  });

  it('shows loading state when loading connections', () => {
    (useSocialMedia as any).mockReturnValue({
      ...mockUseSocialMedia,
      isLoading: true,
    });

    render(
      <SocialMediaTab />
    );

    expect(screen.getByText('Loading social media connections...')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    (useSocialMedia as any).mockReturnValue({
      ...mockUseSocialMedia,
      error: { message: 'Failed to load connections' },
    });

    render(
      <SocialMediaTab />
    );

    expect(screen.getByText('Failed to load social media connections')).toBeInTheDocument();
    expect(screen.getByText('Failed to load connections')).toBeInTheDocument();
  });

  it('handles connecting a social media account', async () => {
    mockUseSocialMedia.connectSocialMedia.mockResolvedValue({ id: '3', platform: 'Instagram' });
    mockUseSocialMedia.getConnectionStatus.mockReturnValue(false);

    render(
      <SocialMediaTab />
    );

    // Find connect button for Instagram and click it
    const connectButtons = screen.getAllByText('Connect');
    fireEvent.click(connectButtons[0]);

    await waitFor(() => {
      expect(mockUseSocialMedia.connectSocialMedia).toHaveBeenCalledWith('Instagram');
    });

    // Check if modal is opened
    expect(screen.getByTestId('connection-modal')).toHaveAttribute('data-is-open', 'true');
  });

  it('handles disconnecting a social media account', async () => {
    mockUseSocialMedia.getConnectionStatus.mockReturnValue(true);

    render(
      <SocialMediaTab />
    );

    // Find disconnect button and click it
    const disconnectButtons = screen.getAllByText('Disconnect');
    fireEvent.click(disconnectButtons[0]);

    await waitFor(() => {
      expect(mockUseSocialMedia.disconnectSocialMedia).toHaveBeenCalled();
    });
  });

  it('shows limited access warning for accounts with limited access', () => {
    mockUseSocialMedia.getConnectionStatus.mockImplementation((platform) => {
      return platform === 'Facebook' || platform === 'Instagram';
    });

    render(
      <SocialMediaTab isAdmin={true} />
    );

    // Check for limited access warning
    expect(screen.getByText('Limited Access')).toBeInTheDocument();
    expect(screen.getByText(/Instagram and Facebook integrations have limited access/)).toBeInTheDocument();
  });
});
