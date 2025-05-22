
import React from 'react';
import { AlertCircle, RefreshCcw, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

interface ConnectionIssueHelperProps {
  errorMessage?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ConnectionIssueHelper: React.FC<ConnectionIssueHelperProps> = ({
  errorMessage = "There was an issue connecting to the database service.",
  onRetry,
  isRetrying = false
}) => {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" /> 
          Supabase Connection Issue
        </CardTitle>
        <CardDescription className="text-amber-700">
          {errorMessage.includes("Invalid API key") 
            ? "The application cannot connect to Supabase due to an invalid API key."
            : errorMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-amber-700">
        <p className="mb-4">To resolve this issue:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Verify that your Supabase project is active and accessible</li>
          <li>Check that the correct API key is configured in your environment variables</li>
          <li>If using local development, ensure your <code>.env</code> file contains valid credentials:
            <pre className="bg-amber-100 p-2 mt-1 rounded text-xs">
              VITE_SUPABASE_URL=https://your-project-ref.supabase.co<br/>
              VITE_SUPABASE_ANON_KEY=your-anon-key
            </pre>
          </li>
          <li>For deployed applications, check that the environment variables are properly configured in your hosting settings</li>
        </ol>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onRetry}
          disabled={isRetrying}
          className="bg-white hover:bg-amber-50 text-amber-700 border-amber-300"
        >
          {isRetrying ? (
            <>
              <RefreshCcw className="mr-2 h-3 w-3 animate-spin" />
              <span>Retrying...</span>
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-3 w-3" />
              <span>Retry Connection</span>
            </>
          )}
        </Button>
        
        <Button 
          variant="link" 
          className="text-amber-700"
          onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
        >
          <ExternalLink className="mr-2 h-3 w-3" />
          Open Supabase Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};
