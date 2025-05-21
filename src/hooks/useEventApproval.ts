
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export const useEventApproval = (eventId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
  const { toast } = useToast();

  const fetchApprovalStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('approval_status, approval_date, rejection_reason')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      
      // Ensure we only set approval status if it's a valid value
      if (data?.approval_status && ['pending', 'approved', 'rejected'].includes(data.approval_status)) {
        setApprovalStatus(data.approval_status as ApprovalStatus);
      } else {
        setApprovalStatus(null);
      }
      
      return data?.approval_status as ApprovalStatus | null;
    } catch (error: any) {
      console.error('Error fetching approval status:', error);
      return null;
    }
  };

  const submitForApproval = async () => {
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('events')
        .update({ 
          approval_status: 'pending' as ApprovalStatus,
          submitted_for_approval_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;

      setApprovalStatus('pending');
      toast({
        title: "Event Submitted",
        description: "Your event has been submitted for restaurant approval.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error submitting for approval:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit event for approval.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveEvent = async (restaurantOwnerId: string) => {
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('events')
        .update({
          approval_status: 'approved',
          approval_date: new Date().toISOString(),
          approved_by: restaurantOwnerId
        })
        .eq('id', eventId);

      if (error) throw error;
      
      setApprovalStatus('approved');
      toast({
        title: "Event Approved",
        description: "You've approved this event. It can now be published.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error approving event:', error);
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve event.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectEvent = async (restaurantOwnerId: string, reason: string) => {
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('events')
        .update({
          approval_status: 'rejected',
          rejection_date: new Date().toISOString(),
          rejected_by: restaurantOwnerId,
          rejection_reason: reason
        })
        .eq('id', eventId);

      if (error) throw error;
      
      setApprovalStatus('rejected');
      toast({
        title: "Event Rejected",
        description: "You've rejected this event.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error rejecting event:', error);
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject event.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    approvalStatus,
    isSubmitting,
    fetchApprovalStatus,
    submitForApproval,
    approveEvent,
    rejectEvent
  };
};
