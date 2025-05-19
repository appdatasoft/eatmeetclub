
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStripeMode } from "@/hooks/membership/useStripeMode";
import { useToast } from "@/hooks/use-toast";

const StripeSettingsPanel: React.FC = () => {
  const { mode, isLoading, error, updateStripeMode, handleRetryStripeCheck } = useStripeMode();
  const { toast } = useToast();
  const [isConfirmingLiveMode, setIsConfirmingLiveMode] = useState(false);
  
  const handleModeChange = async (isLive: boolean) => {
    // If switching to live mode, show confirmation first
    if (isLive && !isConfirmingLiveMode) {
      setIsConfirmingLiveMode(true);
      return;
    }
    
    const newMode = isLive ? "live" : "test";
    const result = await updateStripeMode(newMode);
    
    if (result) {
      toast({
        title: "Stripe Mode Updated",
        description: `Stripe is now in ${newMode} mode`,
        // Fix: Use only the valid variant types from the toast component
        variant: newMode === "live" ? "default" : "destructive",
      });
    } else {
      toast({
        title: "Update Failed",
        description: "Failed to update Stripe mode. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsConfirmingLiveMode(false);
  };
  
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Stripe Payment Mode
        </CardTitle>
        <CardDescription>
          Configure whether Stripe processes real payments or test payments
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Live Mode</h3>
            <p className="text-sm text-gray-500">
              When enabled, real payments will be processed
            </p>
          </div>
          
          <Switch 
            checked={mode === "live"} 
            disabled={isLoading}
            onCheckedChange={(checked) => handleModeChange(checked)}
          />
        </div>
        
        {isConfirmingLiveMode && (
          <Alert variant="warning" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 space-y-2">
              <p>
                <strong>Warning:</strong> Enabling live mode will process real payments and charge real credit cards.
              </p>
              <div className="flex space-x-2 mt-2">
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => handleModeChange(true)}
                >
                  Enable Live Mode
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsConfirmingLiveMode(false)}
                >
                  Cancel
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className={`p-3 rounded-md mt-4 ${mode === "live" ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
          <div className="flex items-center">
            <Info className={`h-4 w-4 mr-2 ${mode === "live" ? "text-red-600" : "text-green-600"}`} />
            <span className={`font-medium ${mode === "live" ? "text-red-800" : "text-green-800"}`}>
              {mode === "live" ? "LIVE MODE" : "TEST MODE"}
            </span>
          </div>
          <p className={`text-sm mt-1 ${mode === "live" ? "text-red-700" : "text-green-700"}`}>
            {mode === "live" 
              ? "Stripe is processing real payments. Real charges will be applied to customer cards."
              : "Stripe is in test mode. No real charges will be applied to customer cards."}
          </p>
        </div>
        
        <div className="border-t pt-3 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetryStripeCheck}
            disabled={isLoading}
          >
            {isLoading ? "Checking..." : "Refresh Status"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeSettingsPanel;
