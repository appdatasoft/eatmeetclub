
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
    // Set a shorter timeout to prevent the connection check from hanging
    const connectionTimeout = setTimeout(() => {
      console.log("Connection check timed out, continuing anyway");
      setConnectionChecking(false);
      setConnectionOk(true); // Assume connection is OK if check times out
    }, 2000); // Reduced to 2 seconds
    
    checkConnection().finally(() => clearTimeout(connectionTimeout));
    
    return () => clearTimeout(connectionTimeout);
  }, [checkConnection]);

  return { connectionChecking, connectionOk };
};
