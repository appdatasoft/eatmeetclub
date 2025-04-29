
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EventForm from "@/components/events/EventForm";
import { useAuth } from "@/hooks/useAuth";

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(false);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('events')
          .select('*, restaurant:restaurants(*)')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setEvent(data);
        
        // Check if user is owner or admin
        const isOwner = user?.id === data.user_id;
        setCanEdit(isOwner || isAdmin);
        
        // If published and not admin/owner, or if user doesn't have edit rights, redirect
        if (data.published && !isOwner && !isAdmin) {
          toast({
            title: "Cannot Edit Published Event",
            description: "Published events cannot be edited.",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
      } catch (error: any) {
        console.error('Error fetching event:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load event details",
          variant: "destructive"
        });
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchEventDetails();
    }
  }, [id, navigate, toast, user, isAdmin]);
  
  const handleUpdateEvent = async (eventData: any) => {
    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this event",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (event.published) {
        toast({
          title: "Cannot Update",
          description: "Published events cannot be modified.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          capacity: eventData.capacity,
          price: eventData.price,
          restaurant_id: eventData.restaurantId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Event Updated",
        description: "Your event has been successfully updated."
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        
        {!isLoading && event ? (
          canEdit ? (
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <EventForm 
                  onSubmit={handleUpdateEvent} 
                  isLoading={isLoading}
                  initialData={{
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    time: event.time,
                    capacity: event.capacity,
                    price: event.price,
                    restaurantId: event.restaurant_id
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 text-red-500">You don't have permission to edit this event.</p>
                <Button onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="flex justify-center py-6">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditEvent;
