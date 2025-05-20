
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSocialMedia } from '@/hooks/useSocialMedia';
import { supabase } from '@/lib/supabaseClient';
import { Spinner } from '@/components/ui/spinner';
import { customFetch } from '@/integrations/supabase/utils/fetchUtils';

const FacebookAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const { fetchConnections } = useSocialMedia();
  
  useEffect(() => {
    // This function handles the OAuth callback
    const processCallback = async () => {
      try {
        console.log('[FacebookAuthCallback] Starting callback processing');
        
        // Get all URL parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorReason = searchParams.get('error_reason');
        const errorDescription = searchParams.get('error_description');
        
        // Current URL for debugging
        const currentUrl = window.location.href;
        const urlWithoutHash = currentUrl.split('#')[0]; // Remove hash fragments
        
        // Log all parameters for debugging
        console.log('[FacebookAuthCallback] Parameters:', {
          code: code ? `${code.substring(0, 10)}... (length: ${code?.length})` : 'null',
          state,
          error,
          errorReason,
          errorDescription,
          currentUrl: urlWithoutHash
        });
        
        // Store debug info
        setDebugInfo({
          code: code ? `${code.substring(0, 10)}... (length: ${code?.length})` : 'null',
          state,
          error,
          errorReason,
          errorDescription,
          url: urlWithoutHash,
          time: new Date().toISOString(),
          userAgent: navigator.userAgent
        });
        
        // Check for error parameters
        if (error || errorReason || errorDescription) {
          console.error('[FacebookAuthCallback] OAuth error:', { error, errorReason, errorDescription });
          setStatus('error');
          setMessage(`Authentication failed: ${errorDescription || errorReason || error}`);
          return;
        }
        
        // Validate required parameters
        if (!code || !state) {
          setStatus('error');
          setMessage('Invalid callback: missing required parameters');
          return;
        }
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('[FacebookAuthCallback] No active session found, redirecting to login');
          setStatus('error');
          setMessage('Authentication failed: No active user session');
          
          // Store the URL to redirect back after login
          localStorage.setItem('redirectAfterLogin', window.location.href);
          
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
          return;
        }
        
        console.log('[FacebookAuthCallback] Session found, user is authenticated');
        
        // Check if it's an Instagram or Facebook connection based on state parameter
        const platform = state.startsWith('instagram_') ? 'Instagram' : 'Facebook';
        console.log(`[FacebookAuthCallback] Processing ${platform} connection`);
        
        // Get Supabase URL
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wocfwpedauuhlrfugxuu.supabase.co';
        
        // Determine the appropriate redirect URI based on the environment
        let redirectUri;
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname.includes('192.168.') || hostname.includes('127.0.0.1')) {
          // Local development
          redirectUri = `${window.location.protocol}//${hostname}:${window.location.port}/api/auth/callback/facebook`;
        } else {
          // Production - use the exact URL from Facebook developers console
          redirectUri = `https://${hostname}/api/auth/callback/facebook`;
        }
        
        console.log(`[FacebookAuthCallback] Using redirectUri: ${redirectUri}`);
        
        const edgeFunctionUrl = `${supabaseUrl}/functions/v1/connect-social-media`;
        console.log(`[FacebookAuthCallback] Edge function URL: ${edgeFunctionUrl}`);
        
        setDebugInfo(prev => ({ 
          ...prev, 
          platform,
          redirectUri,
          edgeFunctionUrl,
          sessionExists: !!session,
          sessionUser: session?.user?.id,
          timestamp: new Date().toISOString()
        }));
        
        try {
          // Use customFetch utility with better error handling
          console.log(`[FacebookAuthCallback] Sending request to edge function with code (length: ${code?.length})`);
          const response = await customFetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              platform,
              action: 'callback',
              code,
              redirectUri,
              state
            })
          });
          
          console.log(`[FacebookAuthCallback] Edge function response status: ${response.status}`);
          
          let rawResponse;
          try {
            // First try to get the response as text
            rawResponse = await response.text();
            console.log('[FacebookAuthCallback] Raw edge function response:', rawResponse?.substring(0, 200));
            
            let result;
            try {
              result = JSON.parse(rawResponse);
              console.log('[FacebookAuthCallback] Parsed response:', result);
              
              setDebugInfo(prev => ({ 
                ...prev, 
                edgeFunctionStatus: response.status,
                edgeFunctionResponse: result,
                requestTime: new Date().toISOString()
              }));
              
              if (!response.ok) {
                throw new Error(result?.error || `Failed to complete ${platform} authentication`);
              }
              
              // Refresh the connections list
              await fetchConnections();
              
              // Show success message
              setStatus('success');
              setMessage(`Your ${platform} account has been successfully connected!`);
              
              toast({
                title: `${platform} Connected`,
                description: result.limited_access 
                  ? `Your ${platform} account was connected with limited functionality.` 
                  : `Your ${platform} account has been successfully connected!`,
                variant: 'default',
              });
              
              // Redirect after a delay
              setTimeout(() => {
                navigate('/dashboard/social-media', { replace: true });
              }, 2000);
              
            } catch (parseError) {
              console.error('[FacebookAuthCallback] Error parsing response:', parseError);
              setDebugInfo(prev => ({ 
                ...prev, 
                parseError: parseError.message, 
                rawResponse: rawResponse?.substring(0, 500) 
              }));
              throw new Error(`Failed to parse response: ${parseError.message}`);
            }
          } catch (responseError) {
            console.error('[FacebookAuthCallback] Error reading response:', responseError);
            setDebugInfo(prev => ({ 
              ...prev, 
              responseError: responseError.message
            }));
            throw responseError;
          }
        } catch (fetchError: any) {
          console.error('[FacebookAuthCallback] Fetch error:', fetchError);
          setDebugInfo(prev => ({ 
            ...prev, 
            fetchError: fetchError.message,
            fetchStack: fetchError.stack
          }));
          throw fetchError;
        }
      } catch (err: any) {
        console.error('[FacebookAuthCallback] Error processing callback:', err);
        setStatus('error');
        setMessage(err.message || 'Failed to process authentication');
        setDebugInfo(prev => ({ 
          ...prev, 
          finalError: err.message, 
          stack: err.stack 
        }));
        
        toast({
          title: 'Connection Failed',
          description: err.message || 'Failed to connect social media account',
          variant: 'destructive',
        });
        
        // Still redirect to dashboard after error for better user experience
        setTimeout(() => {
          navigate('/dashboard/social-media', { replace: true });
        }, 5000); // Longer timeout to give user time to see the error
      }
    };
    
    // Add a small delay to ensure all params are properly loaded
    const timeoutId = setTimeout(() => {
      processCallback();
    }, 1000); // Increase timeout for better reliability
    
    return () => clearTimeout(timeoutId);
  }, [searchParams, navigate, toast, fetchConnections]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Social Media Connection</h1>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center my-8">
            <Spinner size="lg" className="text-primary" />
            <p className="mt-4 text-gray-600">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <Alert variant="default" className="bg-green-50 border-green-200 mb-6">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {/* Always show debug info for now to help troubleshoot */}
        {Object.keys(debugInfo).length > 0 && (
          <div className="mt-4 border border-gray-300 rounded p-4 overflow-auto max-h-60 text-xs">
            <h3 className="font-bold mb-2 flex items-center justify-between">
              <span>Debug Information</span>
              <a 
                href="https://supabase.com/dashboard/project/wocfwpedauuhlrfugxuu/functions/connect-social-media/logs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center"
              >
                <span className="text-xs">View Logs</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        
        <div className="flex justify-center mt-6">
          <Button 
            onClick={() => navigate('/dashboard/social-media')}
            className="w-full"
          >
            Go to Social Media Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FacebookAuthCallback;
