import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase, retryFetch } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EventForm from "@/components/events/EventForm";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const timeoutRef = useRef<number | null>(null);
  
  // Safety timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
        setError("Loading timed out. Please try again.");
        toast({
          title: "Loading timeout",
          description: "Could not load event details. Please try again.",
          variant: "destructive"
        });
      }, 10000); // 10 seconds timeout
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading, toast]);
  
  const fetchEventData = async () => {
    if (!id || !user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Use retryFetch to handle potential network issues
      const { data, error } = await retryFetch(async () => {
        const response = await supabase
          .from('events')
          .select('*, restaurant:restaurants(*)')
          .eq('id', id)
          .single();
          
        return response;
      });
      
      if (error) throw error;
      
      setEvent(data);
      setSelectedRestaurantId(data.restaurant_id);
      
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
      setError(error.message || "Failed to load event details");
      toast({
        title: "Error",
        description: error.message || "Failed to load event details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchRestaurants = async () => {
    try {
      const response = await retryFetch(async () => {
        const response = await supabase
          .from('restaurants')
          .select('id, name')
          .order('name', { ascending: true });
          
        return response;
      });
      
      const { data, error } = response;
      
      if (error) throw error;
      setRestaurants(data || []);
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      // Don't show toast for this as it's not critical
    }
  };
  
  const handleRetry = () => {
    setIsRetrying(true);
    Promise.all([fetchEventData(), fetchRestaurants()])
      .finally(() => {
        setIsRetrying(false);
      });
  };
  
  useEffect(() => {
    if (user) {
      fetchEventData();
      fetchRestaurants();
    }
  }, [id, user, isAdmin]);
  
  const handleUpdateEvent = async (eventData: any) => {
    if (!canEdit || !id) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this event",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (event.published && !isAdmin) {
        toast({
          title: "Cannot Update",
          description: "Published events cannot be modified except by admins.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Updating event with data:", eventData);
      
      const { error } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          capacity: Number(eventData.capacity),
          price: Number(eventData.price),
          restaurant_id: eventData.restaurant_id,
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

  const handleAddRestaurant = () => {
    navigate('/dashboard/add-restaurant');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto" 
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </>
              )}
            </Button>
          </Alert>
        )}
        
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
                  restaurants={restaurants}
                  selectedRestaurantId={selectedRestaurantId}
                  setSelectedRestaurantId={setSelectedRestaurantId}
                  onAddRestaurant={handleAddRestaurant}
                  existingEvent={event}
                  submitLabel="Update Event"
                  onCancel={handleCancel}
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
              {isLoading ? (
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              ) : (
                <Button variant="outline" onClick={handleRetry} disabled={isRetrying}>
                  {isRetrying ? "Retrying..." : "Retry Loading"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditEvent;
