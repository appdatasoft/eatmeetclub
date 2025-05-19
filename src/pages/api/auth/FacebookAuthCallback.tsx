
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSocialMedia } from '@/hooks/useSocialMedia';
import { supabase } from '@/lib/supabaseClient';
import { Spinner } from '@/components/ui/spinner';

const FacebookAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const { fetchConnections } = useSocialMedia();
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('Processing Facebook/Instagram OAuth callback');
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorReason = searchParams.get('error_reason');
        const errorDescription = searchParams.get('error_description');
        
        // Log all parameters for debugging
        console.log({
          code: code ? `${code.substring(0, 10)}...` : 'null',
          state,
          error,
          errorReason,
          errorDescription,
          allSearchParams: Object.fromEntries([...searchParams.entries()])
        });
        
        setDebugInfo({
          code: code ? `${code.substring(0, 10)}...` : 'null',
          state,
          error,
          errorReason,
          errorDescription,
          url: window.location.href,
          time: new Date().toISOString()
        });
        
        if (error || errorReason || errorDescription) {
          console.error('OAuth error:', { error, errorReason, errorDescription });
          setStatus('error');
          setMessage(`Authentication failed: ${errorDescription || errorReason || error}`);
          return;
        }
        
        if (!code || !state) {
          setStatus('error');
          setMessage('Invalid callback: missing parameters');
          return;
        }
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setDebugInfo(prev => ({ ...prev, sessionError }));
        }
        
        if (!session) {
          console.log('No active session found, redirecting to login');
          setStatus('error');
          setMessage('Authentication failed: No active user session');
          
          // Store the URL to redirect back after login
          localStorage.setItem('redirectAfterLogin', `/api/auth/callback/facebook?${searchParams.toString()}`);
          
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
          return;
        }
        
        console.log('Session found, user is authenticated');
        
        // Check if it's an Instagram or Facebook connection based on state parameter
        const platform = state.startsWith('instagram_') ? 'Instagram' : 'Facebook';
        console.log(`Processing ${platform} connection`);
        
        // Call the edge function to process the OAuth callback
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wocfwpedauuhlrfugxuu.supabase.co';
        const redirectUri = 'https://eatmeetclub.com/api/auth/callback/facebook';
        
        console.log(`Calling edge function with platform: ${platform}, redirectUri: ${redirectUri}, supabaseUrl: ${supabaseUrl}`);
        
        // Add artificial delay to ensure supabase auth is fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const edgeFunctionUrl = `${supabaseUrl}/functions/v1/connect-social-media`;
        console.log(`Edge function URL: ${edgeFunctionUrl}`);
        
        try {
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
              redirectUri,
              state
            })
          });
          
          console.log(`Edge function response status: ${response.status}`);
          setDebugInfo(prev => ({ 
            ...prev, 
            edgeFunctionStatus: response.status,
            edgeFunctionUrl,
            requestTime: new Date().toISOString()
          }));
          
          const responseText = await response.text();
          console.log('Raw edge function response:', responseText);
          
          let result;
          try {
            result = JSON.parse(responseText);
            console.log('Parsed response:', result);
            setDebugInfo(prev => ({ ...prev, edgeFunctionResponse: result }));
          } catch (e) {
            console.error('Error parsing response:', e);
            setDebugInfo(prev => ({ 
              ...prev, 
              parseError: e.message, 
              rawResponse: responseText.substring(0, 500) 
            }));
            throw new Error(`Failed to parse response: ${e.message}`);
          }
          
          if (!response.ok) {
            throw new Error(result.error || `Failed to complete ${platform} authentication`);
          }
          
          // Refresh the connections list to reflect the new connection
          await fetchConnections();
          
          // Show success message
          setStatus('success');
          setMessage(`Your ${platform} account has been successfully connected!`);
          
          // Create a custom toast message
          toast({
            title: `${platform} Connected`,
            description: result.limited_access 
              ? `Your ${platform} account was connected with limited functionality.` 
              : `Your ${platform} account has been successfully connected!`,
            variant: 'default',
          });
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/dashboard/social-media', { replace: true });
          }, 2000);
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          setDebugInfo(prev => ({ ...prev, fetchError: fetchError.message }));
          throw fetchError;
        }
        
      } catch (err: any) {
        console.error('Error processing callback:', err);
        setStatus('error');
        setMessage(err.message || 'Failed to process authentication');
        setDebugInfo(prev => ({ ...prev, finalError: err.message, stack: err.stack }));
        
        toast({
          title: 'Connection Failed',
          description: err.message || 'Failed to connect social media account',
          variant: 'destructive',
        });
        
        // Redirect to dashboard after error
        setTimeout(() => {
          navigate('/dashboard/social-media', { replace: true });
        }, 3000);
      }
    };
    
    processCallback();
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
        
        {status === 'error' && Object.keys(debugInfo).length > 0 && (
          <div className="mt-4 border border-gray-300 rounded p-4 overflow-auto max-h-60 text-xs">
            <h3 className="font-bold mb-2">Debug Information</h3>
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
