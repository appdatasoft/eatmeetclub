
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/lib/supabaseClient';

const FacebookCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  
  useEffect(() => {
    // This function processes the OAuth callback
    const processCallback = async () => {
      try {
        console.log('[FacebookCallback] Starting callback processing');
        
        // Get URL parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        // Store debug info
        setDebugInfo({
          code: code ? `${code.substring(0, 10)}... (length: ${code?.length})` : 'null',
          state,
          error,
          errorDescription,
          url: window.location.href,
          time: new Date().toISOString()
        });
        
        // Check for errors
        if (error || errorDescription) {
          console.error('[FacebookCallback] OAuth error:', { error, errorDescription });
          setStatus('error');
          setMessage(`Authentication failed: ${errorDescription || error}`);
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
          console.log('[FacebookCallback] No active session found, redirecting to login');
          setStatus('error');
          setMessage('Authentication failed: No active user session');
          
          // Store the URL to redirect back after login
          localStorage.setItem('redirectAfterLogin', window.location.href);
          
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
          return;
        }
        
        // Determine the platform from state parameter
        const platform = state.startsWith('instagram_') ? 'Instagram' : 'Facebook';
        console.log(`[FacebookCallback] Processing ${platform} connection`);
        
        // Get Supabase URL
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wocfwpedauuhlrfugxuu.supabase.co';
        
        // IMPORTANT: Use a FIXED hardcoded redirect URI that was used in the authorization request
        // This must match character-for-character what was used in the initial auth request
        const redirectUri = "https://preview--eatmeetclub.lovable.app/auth/facebook/callback";
        
        console.log(`[FacebookCallback] Using redirectUri: ${redirectUri}`);
        
        const edgeFunctionUrl = `${supabaseUrl}/functions/v1/connect-social-media`;
        
        try {
          console.log(`[FacebookCallback] Contacting edge function at ${edgeFunctionUrl}`);
          const response = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              platform,
              action: 'callback',
              code,
              redirectUri, // Pass the exact redirect URI
              state
            })
          });
          
          // Get raw response for better debugging
          const rawResponse = await response.text();
          console.log('[FacebookCallback] Raw response:', rawResponse?.substring(0, 500));
          
          let result;
          try {
            result = JSON.parse(rawResponse);
            
            // Update debug info with API response
            setDebugInfo(prev => ({
              ...prev,
              apiResponse: result,
              responseStatus: response.status,
              responseOk: response.ok
            }));
            
            if (!response.ok || !result.success) {
              // Handle Facebook API errors specifically
              if (rawResponse.includes('Invalid verification code format') || 
                  rawResponse.includes('OAuthException')) {
                throw new Error(`Facebook API error: ${result?.error || 'Invalid verification code. This might be due to code expiration or redirect URI mismatch.'}`);
              }
              // Handle database schema errors specifically
              else if (rawResponse.includes('meta_data') && rawResponse.includes('schema cache')) {
                throw new Error(`Database schema issue: The social_media_connections table schema needs to be refreshed. Please contact support.`);
              } else {
                throw new Error(result?.error || `Failed to complete ${platform} authentication`);
              }
            }
            
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
            console.error('[FacebookCallback] Error parsing response:', parseError);
            throw new Error(`Failed to process response: ${parseError.message}`);
          }
        } catch (fetchError: any) {
          console.error('[FacebookCallback] Fetch error:', fetchError);
          throw fetchError;
        }
      } catch (err: any) {
        console.error('[FacebookCallback] Error processing callback:', err);
        setStatus('error');
        setMessage(err.message || 'Failed to process authentication');
        
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
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [searchParams, navigate, toast]);
  
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
        
        {/* Debug info panel */}
        <div className="mt-4 border border-gray-300 rounded p-4 overflow-auto max-h-80 text-xs">
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
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
        
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

export default FacebookCallback;
