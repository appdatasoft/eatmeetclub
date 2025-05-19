
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useEditableContent } from '@/components/editor/EditableContentProvider';
import EditableText from '@/components/editor/EditableText';
import { useToast } from '@/hooks/use-toast';

interface SocialMediaTabProps {
  isAdmin?: boolean;
}

const SocialMediaTab: React.FC<SocialMediaTabProps> = ({ isAdmin = false }) => {
  const { toast } = useToast();
  const { editModeEnabled } = useEditableContent();
  
  const handleConnectAccount = (platform: string) => {
    toast({
      title: `${platform} Integration`,
      description: `This would connect to ${platform}'s API in a real implementation.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Media Accounts</CardTitle>
          <CardDescription>
            Connect your social media accounts to enhance your profile and reach.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instagram */}
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Instagram className="h-5 w-5 text-pink-600" />
                <h3 className="font-medium">Instagram</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleConnectAccount("Instagram")}
              >
                Connect
              </Button>
            </div>
            <EditableText
              id={`${isAdmin ? 'admin' : 'user'}-instagram-description`}
              defaultContent="Connect your Instagram account to share your food experiences and attract more followers."
              className="text-sm text-gray-600"
            />
          </div>

          {/* Twitter/X */}
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Twitter className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium">X (Twitter)</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleConnectAccount("X/Twitter")}
              >
                Connect
              </Button>
            </div>
            <EditableText
              id={`${isAdmin ? 'admin' : 'user'}-twitter-description`}
              defaultContent="Connect your X account to share quick updates and engage with your audience."
              className="text-sm text-gray-600"
            />
          </div>

          {/* Facebook */}
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Facebook Page</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleConnectAccount("Facebook")}
              >
                Connect
              </Button>
            </div>
            <EditableText
              id={`${isAdmin ? 'admin' : 'user'}-facebook-description`}
              defaultContent="Connect your Facebook page to expand your presence and share events with your community."
              className="text-sm text-gray-600"
            />
          </div>

          {/* TikTok */}
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-black">TikTok</span>
                <h3 className="font-medium">TikTok</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleConnectAccount("TikTok")}
              >
                Connect
              </Button>
            </div>
            <EditableText
              id={`${isAdmin ? 'admin' : 'user'}-tiktok-description`}
              defaultContent="Connect your TikTok account to share short video content and reach new audiences."
              className="text-sm text-gray-600"
            />
          </div>

          {/* Yelp */}
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-red-500">Yelp</span>
                <h3 className="font-medium">Yelp</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleConnectAccount("Yelp")}
              >
                Connect
              </Button>
            </div>
            <EditableText
              id={`${isAdmin ? 'admin' : 'user'}-yelp-description`}
              defaultContent="Connect your Yelp account to import reviews and restaurant information."
              className="text-sm text-gray-600"
            />
          </div>
        </CardContent>
      </Card>

      {editModeEnabled && (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm text-blue-800">
          <p>Admin note: Edit mode is active. You can edit the text descriptions by clicking on them.</p>
        </div>
      )}
    </div>
  );
};

export default SocialMediaTab;
