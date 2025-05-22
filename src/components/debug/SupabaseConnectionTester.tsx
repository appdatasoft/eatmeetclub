
import { useState } from "react";
import { Button } from "../ui/button";
import { checkSupabaseConnection } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export const SupabaseConnectionTester = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<boolean | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    setErrorDetails(null);
    
    try {
      const result = await checkSupabaseConnection();
      setLastResult(result);
      
      if (!result) {
        setErrorDetails("Connection failed. Please check your Supabase configuration.");
      }
    } catch (error: any) {
      setLastResult(false);
      setErrorDetails(error.message || "Unknown error occurred during connection test");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Supabase Connection Status</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={checkConnection}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>
      </div>

      {lastResult !== null && (
        <Alert variant={lastResult ? "default" : "destructive"}>
          {lastResult ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Connection Successful</AlertTitle>
              <AlertDescription>
                Your application is properly connected to Supabase.
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Failed</AlertTitle>
              <AlertDescription>
                {errorDetails || "Unable to connect to Supabase. Please check your configuration."}
                <div className="mt-2 text-xs">
                  <p>Make sure:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Your Supabase API key is correct and not expired</li>
                    <li>Your Supabase URL is correct</li>
                    <li>Your Supabase project is active</li>
                  </ul>
                </div>
              </AlertDescription>
            </>
          )}
        </Alert>
      )}
    </div>
  );
};

export default SupabaseConnectionTester;
