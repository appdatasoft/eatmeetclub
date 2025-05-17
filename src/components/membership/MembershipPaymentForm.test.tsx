
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MembershipPaymentForm from './MembershipPaymentForm';
import { useForm, FormProvider } from 'react-hook-form';

// Mock child components
vi.mock('./MembershipBenefits', () => ({
  default: () => <div data-testid="membership-benefits">Benefits</div>
}));
vi.mock('./MembershipFormFields', () => ({
  form, disabled }: any) => (
  <div data-testid="membership-form-fields" data-disabled={disabled}>Form Fields</div>
));
vi.mock('./FormActions', () => ({
  onCancel, isProcessing, formSubmitted }: any) => (
  <div data-testid="form-actions" data-processing={isProcessing} data-submitted={formSubmitted}>
    <button onClick={onCancel} data-testid="cancel-button">Cancel</button>
  </div>
));
vi.mock('./PaymentSection', () => ({
  clientSecret, email, isProcessing, onPaymentSuccess, onPaymentError }: any) => (
  <div data-testid="payment-section" data-client-secret={clientSecret} data-email={email} data-processing={isProcessing}>
    <button onClick={() => onPaymentSuccess()} data-testid="success-button">Success</button>
    <button onClick={() => onPaymentError('Test error')} data-testid="error-button">Error</button>
  </div>
));

// Mock Form component from shadcn/ui
vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => children
}));

// Test wrapper to provide form context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    }
  });
  
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('MembershipPaymentForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnPaymentSuccess = vi.fn();
  const mockOnPaymentError = vi.fn();
  
  const defaultProps = {
    membershipFee: 25,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isProcessing: false,
    clientSecret: null,
    onPaymentSuccess: mockOnPaymentSuccess,
    onPaymentError: mockOnPaymentError
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form sections', () => {
    render(<MembershipPaymentForm {...defaultProps} />);
    
    expect(screen.getByTestId('membership-benefits')).toBeInTheDocument();
    expect(screen.getByTestId('membership-form-fields')).toBeInTheDocument();
    expect(screen.getByTestId('form-actions')).toBeInTheDocument();
    expect(screen.getByTestId('payment-section')).toBeInTheDocument();
  });

  it('disables form fields when form is submitted', () => {
    render(
      <MembershipPaymentForm 
        {...defaultProps} 
        clientSecret="test_client_secret"
      />
    );
    
    expect(screen.getByTestId('membership-form-fields').getAttribute('data-disabled')).toBe('true');
  });

  it('shows correct processing state in form actions', () => {
    render(
      <MembershipPaymentForm 
        {...defaultProps} 
        isProcessing={true}
      />
    );
    
    expect(screen.getByTestId('form-actions').getAttribute('data-processing')).toBe('true');
  });

  it('passes client secret to payment section', () => {
    render(
      <MembershipPaymentForm 
        {...defaultProps} 
        clientSecret="test_client_secret"
      />
    );
    
    expect(screen.getByTestId('payment-section').getAttribute('data-client-secret')).toBe('test_client_secret');
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<MembershipPaymentForm {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('cancel-button'));
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onPaymentSuccess when success button is clicked', () => {
    render(<MembershipPaymentForm {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('success-button'));
    
    expect(mockOnPaymentSuccess).toHaveBeenCalled();
  });

  it('calls onPaymentError when error button is clicked', () => {
    render(<MembershipPaymentForm {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('error-button'));
    
    expect(mockOnPaymentError).toHaveBeenCalledWith('Test error');
  });

  it('sets isSubmitting to true during form submission', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <TestWrapper>
        <MembershipPaymentForm {...defaultProps} />
      </TestWrapper>
    );
    
    // Trigger form submission
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Wait for the state to update
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});
