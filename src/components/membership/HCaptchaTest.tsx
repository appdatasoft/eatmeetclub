
import { useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const HCaptchaTest = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const { toast } = useToast();

  const handleVerifyCaptcha = (token: string) => {
    console.log('hCaptcha token:', token);
    setToken(token);
  };

  const handleExpire = () => {
    console.log('hCaptcha token expired');
    setToken(null);
  };

  const handleError = (err: any) => {
    console.error('hCaptcha error:', err);
    toast({
      variant: 'destructive',
      title: 'hCaptcha Error',
      description: err?.message || 'An error occurred with hCaptcha verification'
    });
  };

  const testVerification = async () => {
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Missing Token',
        description: 'Please complete the hCaptcha verification first'
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/test-hcaptcha`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hcaptchaToken: token }),
        }
      );

      const result = await response.json();
      setVerificationResult(result);

      if (result.success) {
        toast({
          title: 'Verification Successful',
          description: 'hCaptcha token verified successfully'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: result.error || 'hCaptcha verification failed'
        });
      }
    } catch (error) {
      console.error('Error verifying hCaptcha token:', error);
      toast({
        variant: 'destructive',
        title: 'Verification Error',
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-medium">hCaptcha Test</h3>
      
      <div className="flex flex-col items-center space-y-4">
        <HCaptcha
          sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001"}
          onVerify={handleVerifyCaptcha}
          onExpire={handleExpire}
          onError={handleError}
        />

        <Button 
          onClick={testVerification} 
          disabled={!token || isVerifying}
          className="w-full max-w-xs"
        >
          {isVerifying ? 'Verifying...' : 'Verify Token'}
        </Button>
      </div>

      {verificationResult && (
        <Alert variant={verificationResult.success ? "default" : "destructive"}>
          <AlertTitle>
            {verificationResult.success ? 'Verification Successful' : 'Verification Failed'}
          </AlertTitle>
          <AlertDescription className="mt-2">
            <pre className="text-xs overflow-auto p-2 bg-gray-50 rounded">
              {JSON.stringify(verificationResult, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default HCaptchaTest;
