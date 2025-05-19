
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Map, Globe, Youtube, AlertCircle, Link2Off } from "lucide-react";
import { useEditableContent } from '@/components/editor/EditableContentProvider';
import EditableText from '@/components/editor/EditableText';
import { useToast } from '@/hooks/use-toast';
import { useSocialMedia, SocialMediaConnection } from '@/hooks/useSocialMedia';
import ConnectionDetailsModal from './ConnectionDetailsModal';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SocialMediaTabProps {
  isAdmin?: boolean;
}

const SocialMediaTab: React.FC<SocialMediaTabProps> = ({ isAdmin = false }) => {
  const { toast } = useToast();
  const { editModeEnabled } = useEditableContent();
  const { 
    connections, 
    isLoading, 
    oauthPending,
    fetchConnections, 
    connectSocialMedia,
    getConnectionStatus,
    disconnectSocialMedia
  } = useSocialMedia();
  
  const [selectedConnection, setSelectedConnection] = useState<SocialMediaConnection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  useEffect(() => {
    fetchConnections();
  }, []);

  // All OAuth callback handling is now in useSocialMedia hook

  const handleConnectAccount = async (platform: string) => {
    try {
      const result = await connectSocialMedia(platform);
      
      // For Instagram and Facebook, we don't show modal since it will redirect to OAuth
      if (result && !result.pending) {
        const connection = connections.find(conn => conn.platform === platform) || result;
        setSelectedConnection(connection);
        setIsModalOpen(true);
      }
    } catch (error) {
      toast({
        title: `${platform} Integration Error`,
        description: `There was a problem connecting to ${platform}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDisconnectAccount = async (platform: string) => {
    try {
      await disconnectSocialMedia(platform);
      toast({
        title: 'Account Disconnected',
        description: `Successfully disconnected your ${platform} account.`,
      });
    } catch (error) {
      toast({
        title: `${platform} Disconnection Error`,
        description: `There was a problem disconnecting from ${platform}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const renderConnectionButton = (platform: string) => {
    const isConnected = getConnectionStatus(platform);
    
    if (isConnected) {
      return (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Show details for already connected account
              const connection = connections.find(conn => conn.platform === platform);
              if (connection) {
                setSelectedConnection(connection);
                setIsModalOpen(true);
              }
            }}
            disabled={isLoading || oauthPending}
          >
            Connected
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={() => handleDisconnectAccount(platform)}
            disabled={isLoading || oauthPending}
          >
            <Link2Off className="h-4 w-4 mr-1" />
            <span>Disconnect</span>
          </Button>
        </div>
      );
    } else {
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleConnectAccount(platform)}
          disabled={isLoading || oauthPending}
        >
          Connect
        </Button>
      );
    }
  };

  return (
    <div className="space-y-6">
      {oauthPending && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Processing social media connection. Please wait...
          </AlertDescription>
        </Alert>
      )}
      
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
              {renderConnectionButton("Instagram")}
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
              {renderConnectionButton("X/Twitter")}
            </div>
            <EditableText
              id={`${isAdmin ? 'admin' : 'user'}-twitter-description`}
              defaultContent="Connect your X account to share quick updates and engage with your audience."
              className="text-sm text-gray-600"
            />
          </div>

          {/* YouTube */}
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Youtube className="h-5 w-5 text-red-600" />
                <h3 className="font-medium">YouTube</h3>
              </div>
              {renderConnectionButton("YouTube")}
            </div>
            <EditableText
              id={`${isAdmin ? 'admin' : 'user'}-youtube-description`}
              defaultContent="Connect your YouTube channel to share videos and grow your audience."
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
              {renderConnectionButton("Facebook")}
            </div>
            <EditableText
              id={`${isAdmin ? 'admin' : 'user'}-facebook-description`}
              defaultContent="Connect your Facebook page to expand your presence and share events with your community."
              className="text-sm text-gray-600"
            />
          </div>

          {/* Google Business Page */}
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Google Business</h3>
              </div>
              {renderConnectionButton("Google Business")}
            </div>
            <EditableText
              id={`${isAdmin ? 'admin' : 'user'}-google-business-description`}
              defaultContent="Connect your Google Business Profile to improve local visibility and manage your business information."
              className="text-sm text-gray-600"
            />
          </div>

          {/* Google Maps */}
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Map className="h-5 w-5 text-red-600" />
                <h3 className="font-medium">Google Maps</h3>
              </div>
              {renderConnectionButton("Google Maps")}
            </div>
            <EditableText
              id={`${isAdmin ? 'admin' : 'user'}-google-maps-description`}
              defaultContent="Connect your Google Maps listing to help customers find your location and get directions easily."
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
              {renderConnectionButton("TikTok")}
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
              {renderConnectionButton("Yelp")}
            </div>
            <EditableText
              id={`${isAdmin ? 'admin' : 'user'}-yelp-description`}
              defaultContent="Connect your Yelp account to import reviews and restaurant information."
              className="text-sm text-gray-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Connection Details Modal */}
      <ConnectionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        connection={selectedConnection}
      />

      {editModeEnabled && (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm text-blue-800">
          <p>Admin note: Edit mode is active. You can edit the text descriptions by clicking on them.</p>
        </div>
      )}
    </div>
  );
};

export default SocialMediaTab;
