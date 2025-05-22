
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type ConnectionStatus = 'checking' | 'connected' | 'error';

export const useSupabaseConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    setStatus('checking');
    setErrorMessage(null);
    
    try {
      const { error } = await supabase.from('app_config').select('key').limit(1);
      
      if (error) {
        console.error('Supabase connection check failed:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Failed to connect to database');
        return false;
      }
      
      setStatus('connected');
      return true;
    } catch (err: any) {
      console.error('Exception checking Supabase connection:', err);
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLastChecked(new Date());
    }
  }, []);

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
    checkConnection
  };
};
