
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSocialMedia } from '@/hooks/useSocialMedia';

const FacebookAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const { fetchConnections } = useSocialMedia();
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        
        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }
        
        if (!code || !state) {
          setStatus('error');
          setMessage('Invalid callback: missing parameters');
          return;
        }
        
        // The actual processing is done in the useSocialMedia hook's effect
        // Here we just show a success message
        await fetchConnections();
        setStatus('success');
        setMessage('Authentication successful! Your account has been connected.');
        
        toast({
          title: 'Connection Successful',
          description: 'Your social media account has been connected.',
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/dashboard/social-media');
        }, 2000);
        
      } catch (err: any) {
        console.error('Error processing callback:', err);
        setStatus('error');
        setMessage(err.message || 'Failed to process authentication');
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
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
