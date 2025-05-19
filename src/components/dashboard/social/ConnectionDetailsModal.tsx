
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SocialMediaConnection } from '@/hooks/useSocialMedia';
import { Link, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ConnectionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connection: SocialMediaConnection | null;
}

const ConnectionDetailsModal: React.FC<ConnectionDetailsModalProps> = ({
  isOpen,
  onClose,
  connection
}) => {
  if (!connection) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{connection.platform} Connection Details</DialogTitle>
          <DialogDescription>
            Your account has been successfully connected.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Connected
                  </span>
                </div>
                
                {connection.username && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Username:</span>
                    <span className="text-sm">{connection.username}</span>
                  </div>
                )}
                
                {connection.profile_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Profile:</span>
                    <a 
                      href={connection.profile_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline flex items-center"
                    >
                      View profile
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connected on:</span>
                  <span className="text-sm">
                    {connection.created_at ? new Date(connection.created_at).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionDetailsModal;
