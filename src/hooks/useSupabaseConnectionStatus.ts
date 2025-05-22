
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type ConnectionStatus = 'checking' | 'connected' | 'error';
type ErrorType = 'api_key' | 'network' | 'permission' | 'unknown';

export const useSupabaseConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [checkCount, setCheckCount] = useState<number>(0);

  const checkConnection = useCallback(async () => {
    setStatus('checking');
    setErrorMessage(null);
    setErrorType(null);
    setCheckCount(prev => prev + 1);
    
    try {
      const { error } = await supabase.from('app_config').select('key').limit(1);
      
      if (error) {
        console.error('Supabase connection check failed:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Failed to connect to database');
        
        // Determine error type based on the error message or code instead of status
        if (error.message?.includes('Invalid API key') || error.code === '401') {
          setErrorType('api_key');
        } else if (error.message?.includes('permission') || error.code === '403') {
          setErrorType('permission');
        } else if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
          setErrorType('network');
        } else {
          setErrorType('unknown');
        }
        
        return false;
      }
      
      setStatus('connected');
      return true;
    } catch (err: any) {
      console.error('Exception checking Supabase connection:', err);
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred');
      setErrorType(err.message?.includes('network') ? 'network' : 'unknown');
      return false;
    } finally {
      setLastChecked(new Date());
    }
  }, []);

  const getErrorSuggestion = useCallback(() => {
    switch(errorType) {
      case 'api_key':
        return "Your API key appears to be invalid. Check your environment variables or Supabase project settings.";
      case 'network':
        return "There seems to be a network issue. Check your internet connection.";
      case 'permission':
        return "You don't have permission to access this resource. Check your Row Level Security policies.";
      default:
        return "An unexpected error occurred. Try refreshing the page or check the console for more details.";
    }
  }, [errorType]);

  useEffect(() => {
    checkConnection();
    
    // Recheck connection periodically
    const interval = setInterval(() => {
      checkConnection();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    status,
    lastChecked,
    errorMessage,
    errorType,
    checkCount,
    checkConnection,
    getErrorSuggestion
  };
};
