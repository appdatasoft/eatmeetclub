
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Save } from "lucide-react";
import { useTicketDistribution } from '@/hooks/useTicketDistribution';

interface EventDistributionSettingsProps {
  eventId: string;
  isRestaurantOwner: boolean;
  restaurantId: string;
}

export const EventDistributionSettings: React.FC<EventDistributionSettingsProps> = ({
  eventId,
  isRestaurantOwner,
  restaurantId
}) => {
  const { 
    distributionConfig,
    isLoading,
    updateAmbassadorFeePercentage
  } = useTicketDistribution(eventId);
  
  const [ambassadorFeePercentage, setAmbassadorFeePercentage] = useState(distributionConfig.ambassadorFeePercentage);
  const [isSaving, setIsSaving] = useState(false);
  
  // Only restaurant owners can modify these settings
  if (!isRestaurantOwner) {
    return null;
  }
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateAmbassadorFeePercentage(ambassadorFeePercentage);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Revenue Distribution Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Revenue Distribution Settings</CardTitle>
        <CardDescription>
          Configure how ticket revenue is distributed among different parties
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Platform Fee</span>
            <span className="text-gray-600">{distributionConfig.appFeePercentage}%</span>
          </div>
          <Slider
            disabled={true}
            defaultValue={[distributionConfig.appFeePercentage]}
            max={30}
            step={1}
          />
          <p className="text-xs text-gray-500 mt-1">
            Platform fee is fixed and cannot be modified
          </p>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Affiliate Commission</span>
            <span className="text-gray-600">{distributionConfig.affiliateFeePercentage}%</span>
          </div>
          <Slider
            disabled={true}
            defaultValue={[distributionConfig.affiliateFeePercentage]}
            max={30}
            step={1}
          />
          <p className="text-xs text-gray-500 mt-1">
            Affiliate commission is fixed by the platform
          </p>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Ambassador Commission</span>
            <span className="text-gray-600">{ambassadorFeePercentage}%</span>
          </div>
          <Slider
            value={[ambassadorFeePercentage]}
            onValueChange={(value) => setAmbassadorFeePercentage(value[0])}
            max={30}
            step={1}
          />
          <p className="text-xs text-gray-500 mt-1">
            Set the commission percentage for event ambassadors who create events
          </p>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Revenue Breakdown</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Platform Fee:</span>
              <span>{distributionConfig.appFeePercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Affiliate Commission:</span>
              <span>{distributionConfig.affiliateFeePercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Ambassador Commission:</span>
              <span>{ambassadorFeePercentage}%</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t border-gray-200 mt-1">
              <span>Restaurant Revenue:</span>
              <span>{100 - distributionConfig.appFeePercentage - distributionConfig.affiliateFeePercentage - ambassadorFeePercentage}%</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={ambassadorFeePercentage === distributionConfig.ambassadorFeePercentage || isSaving}
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
};
