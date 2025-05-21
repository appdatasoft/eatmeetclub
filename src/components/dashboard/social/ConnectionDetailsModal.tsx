
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SocialMediaConnection } from '@/hooks/useSocialMedia';
import { Badge } from '@/components/ui/badge';
import { Calendar, LinkIcon, AtSign, User, Key, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connection: SocialMediaConnection | null;
}

const ConnectionDetailsModal: React.FC<ConnectionDetailsModalProps> = ({
  isOpen,
  onClose,
  connection,
}) => {
  if (!isOpen) return null;
  if (!connection) return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connection Details</DialogTitle>
          <DialogDescription>No connection details available</DialogDescription>
        </DialogHeader>
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const hasOAuthData = connection.oauth_token || connection.oauth_token_secret || connection.oauth_expires_at;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {connection.platform} Connection
            <Badge 
              className="ml-2" 
              variant={connection.is_connected ? "default" : "outline"}
            >
              {connection.is_connected ? "Connected" : "Disconnected"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Details for your {connection.platform} account connection
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {connection.username && (
            <div className="flex items-center gap-2">
              <AtSign className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Username:</span>
              <span>{connection.username}</span>
            </div>
          )}
          
          {connection.profile_url && (
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Profile URL:</span>
              <a 
                href={connection.profile_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {connection.profile_url}
              </a>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Connected on:</span>
            <span>{formatDate(connection.created_at)}</span>
          </div>
          
          {connection.updated_at && connection.updated_at !== connection.created_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Last updated:</span>
              <span>{formatDate(connection.updated_at)}</span>
            </div>
          )}
          
          {hasOAuthData && (
            <>
              <div className="my-4 border-t border-gray-200"></div>
              <h4 className="font-medium text-sm text-gray-700">OAuth Information</h4>
              
              {connection.oauth_token && (
                <div className="flex items-start gap-2">
                  <Key className="h-4 w-4 text-gray-500 mt-1" />
                  <span className="font-medium">Access token:</span>
                  <span className="break-all text-sm">
                    {connection.oauth_token.substring(0, 10)}...
                  </span>
                </div>
              )}
              
              {connection.oauth_expires_at && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Expires:</span>
                  <span>{formatDate(connection.oauth_expires_at)}</span>
                </div>
              )}
              
              {connection.meta_data && Object.keys(connection.meta_data).length > 0 && connection.meta_data.instagram_user_id && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-gray-500 mt-1" />
                  <span className="font-medium">Platform ID:</span>
                  <span className="break-all text-sm">
                    {connection.meta_data.instagram_user_id}
                  </span>
                </div>
              )}
            </>
          )}
          
          {connection.meta_data?.limited_access && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
              <p className="font-medium">This connection has limited access</p>
              <p className="text-xs mt-1">Some features may be restricted due to platform limitations.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          ID: {connection.id || 'N/A'}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionDetailsModal;
