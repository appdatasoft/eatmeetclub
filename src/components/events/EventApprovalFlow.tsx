
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useEventApproval, ApprovalStatus } from '@/hooks/useEventApproval';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface EventApprovalFlowProps {
  eventId: string;
  restaurantId: string;
  restaurantOwnerId: string;
  eventCreatorId: string;
}

export const EventApprovalFlow: React.FC<EventApprovalFlowProps> = ({
  eventId,
  restaurantId,
  restaurantOwnerId,
  eventCreatorId
}) => {
  const { user } = useAuth();
  const { approvalStatus, isSubmitting, fetchApprovalStatus, submitForApproval, approveEvent, rejectEvent } = useEventApproval(eventId);
  
  const [isRestaurantOwner, setIsRestaurantOwner] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  useEffect(() => {
    if (user && restaurantOwnerId) {
      setIsRestaurantOwner(user.id === restaurantOwnerId);
    }
    
    if (user && eventCreatorId) {
      setIsCreator(user.id === eventCreatorId);
    }
    
    fetchApprovalStatus();
  }, [user, restaurantOwnerId, eventCreatorId]);
  
  const handleSubmitForApproval = async () => {
    await submitForApproval();
  };
  
  const handleApprove = async () => {
    if (user) {
      await approveEvent(user.id);
    }
  };
  
  const handleOpenRejectDialog = () => {
    setIsRejectDialogOpen(true);
  };
  
  const handleReject = async () => {
    if (user && rejectionReason.trim()) {
      await rejectEvent(user.id, rejectionReason);
      setIsRejectDialogOpen(false);
    }
  };
  
  const getStatusBadge = () => {
    switch (approvalStatus) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" /> Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
          <AlertCircle className="w-4 h-4 mr-1" /> Pending Approval
        </Badge>;
      default:
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  // Don't show anything if user is neither the restaurant owner nor the event creator
  if (!isRestaurantOwner && !isCreator) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Restaurant Approval</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent>
        {approvalStatus === null && isCreator && (
          <p className="text-gray-600">
            This event must be approved by the restaurant owner before it can be published.
          </p>
        )}
        
        {approvalStatus === 'pending' && (
          <p className="text-yellow-700 bg-yellow-50 p-3 rounded-md">
            This event is awaiting approval from the restaurant owner.
          </p>
        )}
        
        {approvalStatus === 'approved' && (
          <p className="text-green-700 bg-green-50 p-3 rounded-md">
            This event has been approved by the restaurant owner and can be published.
          </p>
        )}
        
        {approvalStatus === 'rejected' && (
          <div className="text-red-700 bg-red-50 p-3 rounded-md space-y-2">
            <p>This event was rejected by the restaurant owner.</p>
            <p className="font-medium">Reason: </p>
            <p className="bg-white p-2 rounded border border-red-200">{rejectionReason || "No reason provided."}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-3">
        {/* Event creator controls */}
        {isCreator && !approvalStatus && (
          <Button 
            onClick={handleSubmitForApproval} 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit for Approval
          </Button>
        )}
        
        {/* Restaurant owner controls */}
        {isRestaurantOwner && approvalStatus === 'pending' && (
          <>
            <Button 
              variant="outline"
              onClick={handleOpenRejectDialog}
              disabled={isSubmitting}
            >
              Reject
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Approve
            </Button>
          </>
        )}
      </CardFooter>
      
      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Event</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this event. This will be shared with the event creator.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Reason for rejection"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reject Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
