
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSocialMedia } from '@/hooks/useSocialMedia';
import { supabase } from '@/integrations/supabase/client';

export const FacebookAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const { refreshConnections } = useSocialMedia();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Process the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        await refreshConnections();
        
        toast({
          title: "Account Connected",
          description: "Your Facebook account has been successfully connected.",
        });
        
        // Redirect back to social media page
        navigate('/dashboard/social-media');
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        toast({
          title: "Connection Error",
          description: "There was a problem connecting your account. Please try again.",
          variant: "destructive",
        });
        
        navigate('/dashboard/social-media');
      } finally {
        setIsProcessing(false);
      }
    };
    
    processOAuthCallback();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Processing Connection</h1>
          {isProcessing ? (
            <p className="mt-2 text-gray-600">Please wait while we verify your account...</p>
          ) : (
            <p className="mt-2 text-gray-600">Redirecting you back...</p>
          )}
          
          <div className="mt-6 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookAuthCallback;
