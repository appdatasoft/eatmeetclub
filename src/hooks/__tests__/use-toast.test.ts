
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useToast, toast } from '../use-toast';
import { toast as sonnerToast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    default: vi.fn()
  }
}));

describe('useToast and toast', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Rename sonnerToast default function for easier mocking
    (sonnerToast as any) = vi.fn();
    (sonnerToast as any).error = vi.fn();
  });

  describe('useToast hook', () => {
    it('should show default toast with title and description', () => {
      const { toast: showToast } = useToast();
      
      showToast({ title: 'Test Title', description: 'Test Description' });
      
      expect(sonnerToast).toHaveBeenCalledWith('Test Title', {
        description: 'Test Description',
        action: undefined
      });
    });
    
    it('should show error toast when variant is destructive', () => {
      const { toast: showToast } = useToast();
      
      showToast({ 
        title: 'Error Title', 
        description: 'Error Description',
        variant: 'destructive'
      });
      
      expect(sonnerToast.error).toHaveBeenCalledWith('Error Title', {
        description: 'Error Description',
        action: undefined
      });
    });
    
    it('should handle string only parameter', () => {
      const { toast: showToast } = useToast();
      
      showToast('Simple Message');
      
      expect(sonnerToast).toHaveBeenCalledWith('Simple Message');
    });
  });
  
  describe('toast function', () => {
    it('should show default toast with title and description', () => {
      toast({ title: 'Test Title', description: 'Test Description' });
      
      expect(sonnerToast).toHaveBeenCalledWith('Test Title', {
        description: 'Test Description',
        action: undefined
      });
    });
    
    it('should show error toast when variant is destructive', () => {
      toast({ 
        title: 'Error Title', 
        description: 'Error Description',
        variant: 'destructive'
      });
      
      expect(sonnerToast.error).toHaveBeenCalledWith('Error Title', {
        description: 'Error Description',
        action: undefined
      });
    });
    
    it('should handle string only parameter', () => {
      toast('Simple Message');
      
      expect(sonnerToast).toHaveBeenCalledWith('Simple Message', undefined);
    });
    
    it('should pass additional options', () => {
      const options = { duration: 5000 };
      
      toast({ title: 'With Options' }, options);
      
      expect(sonnerToast).toHaveBeenCalledWith('With Options', {
        description: undefined,
        action: undefined,
        duration: 5000
      });
    });
  });
});
