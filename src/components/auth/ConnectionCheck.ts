
import { useState, useEffect, useCallback } from 'react';
import { checkSupabaseConnection } from '@/integrations/supabase/client';

interface UseConnectionCheckResult {
  connectionChecking: boolean;
  connectionOk: boolean;
}

export const useConnectionCheck = (): UseConnectionCheckResult => {
  const [connectionChecking, setConnectionChecking] = useState(true);
  const [connectionOk, setConnectionOk] = useState(true);

  const checkConnection = useCallback(async () => {
    try {
      setConnectionChecking(true);
      const isConnected = await checkSupabaseConnection();
      console.log("Supabase connection check result:", isConnected);
      setConnectionOk(isConnected);
    } catch (error) {
      console.error("Connection check error:", error);
      setConnectionOk(false);
    } finally {
      setConnectionChecking(false);
    }
  }, []);

  useEffect(() => {
    // Set a timeout to prevent the connection check from hanging
    const connectionTimeout = setTimeout(() => {
      setConnectionChecking(false);
      console.log("Connection check timed out, continuing anyway");
    }, 3000);
    
    checkConnection().finally(() => clearTimeout(connectionTimeout));
    
  }, [checkConnection]);

  return { connectionChecking, connectionOk };
};
