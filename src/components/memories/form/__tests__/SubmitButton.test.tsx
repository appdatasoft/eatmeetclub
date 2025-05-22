
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SubmitButton from '../SubmitButton';

describe('SubmitButton', () => {
  it('renders create mode button when not in edit mode', () => {
    render(<SubmitButton isLoading={false} />);
    
    expect(screen.getByText('Create Memory')).toBeInTheDocument();
    expect(screen.queryByText('Update Memory')).not.toBeInTheDocument();
  });
  
  it('renders edit mode button when in edit mode', () => {
    render(<SubmitButton isLoading={false} isEditMode={true} />);
    
    expect(screen.getByText('Update Memory')).toBeInTheDocument();
    expect(screen.queryByText('Create Memory')).not.toBeInTheDocument();
  });
  
  it('disables button and shows loading indicator when loading', () => {
    render(<SubmitButton isLoading={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Creating Memory...')).toBeInTheDocument();
  });
  
  it('disables button and shows loading indicator when uploading', () => {
    render(<SubmitButton isLoading={false} isUploading={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
  
  it('shows correct loading text in edit mode', () => {
    render(<SubmitButton isLoading={true} isEditMode={true} />);
    
    expect(screen.getByText('Updating Memory...')).toBeInTheDocument();
  });
});
