
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditableText from '../EditableText';
import { useEditableContent } from '../EditableContentProvider';

// Mock the hook
vi.mock('../EditableContentProvider', () => ({
  useEditableContent: vi.fn(),
}));

describe('EditableText', () => {
  const mockHandleEdit = vi.fn();
  const mockHandleSave = vi.fn();
  const mockHandleCancel = vi.fn();
  const mockHandleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useEditableContent as any).mockReturnValue({
      contentMap: {},
      isEditing: null,
      handleEdit: mockHandleEdit,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
      canEdit: true,
    });
  });

  it('renders default content when no content is in contentMap', () => {
    render(<EditableText id="test" defaultContent="Default text" />);
    
    expect(screen.getByText('Default text')).toBeInTheDocument();
  });

  it('renders content from contentMap when available', () => {
    (useEditableContent as any).mockReturnValue({
      contentMap: { test: { content: 'Content from map' } },
      isEditing: null,
      handleEdit: mockHandleEdit,
      handleSave: mockHandleSave,
      handleCancel: mockHandleCancel,
      canEdit: true,
    });

    render(<EditableText id="test" defaultContent="Default text" />);
    
    expect(screen.getByText('Content from map')).toBeInTheDocument();
  });

  it('renders children as content when children are provided', () => {
    render(
      <EditableText id="test" defaultContent="Default text">
        Child content
      </EditableText>
    );
    
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders editable state when isEditing matches id', () => {
    (useEditableContent as any).mockReturnValue({
      contentMap: { test: { content: 'Content from map' } },
      isEditing: 'test',
      handleEdit: mockHandleEdit,
      handleSave: mockHandleChange,
      handleCancel: mockHandleCancel,
      canEdit: true,
    });

    render(
      <EditableText 
        id="test" 
        defaultContent="Default text"
        contentType="text"
      />
    );
    
    // When in edit mode, there should be an input field
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    
    // There should also be save and cancel buttons
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when canEdit is false and no content is available', () => {
    (useEditableContent as any).mockReturnValue({
      contentMap: {},
      isEditing: null,
      handleEdit: mockHandleEdit,
      handleSave: mockHandleChange,
      handleCancel: mockHandleCancel,
      canEdit: false,
    });

    const { container } = render(
      <EditableText 
        id="test"
      />
    );
    
    // Container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('uses the correct HTML tag', () => {
    (useEditableContent as any).mockReturnValue({
      contentMap: { test: { content: 'Content from map' } },
      isEditing: null,
      handleEdit: mockHandleEdit,
      handleSave: mockHandleChange,
      handleCancel: mockHandleCancel,
      canEdit: true,
    });

    render(
      <EditableText 
        id="test" 
        tag="h2"
        defaultContent="Default text"
      />
    );
    
    const heading = screen.getByText('Content from map');
    expect(heading.tagName).toBe('H2');
  });
});
