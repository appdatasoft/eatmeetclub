
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import RetryAlert from "@/components/ui/RetryAlert";
import MainLayout from "@/components/layout/MainLayout";
import { fetchWithRetry } from "@/utils/fetchUtils";

interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  created_at: string;
  role?: string;
}

interface UserEvent {
  id: string;
  title: string;
  date: string;
  price: number;
  cover_image?: string;
  restaurant_name: string;
}

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [eventsCreated, setEventsCreated] = useState<UserEvent[]>([]);
  const [eventsAttending, setEventsAttending] = useState<UserEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelf, setIsSelf] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // If on /profile route with no ID, use the current user's ID
    // or redirect to login if not logged in
    if (!id && !currentUser) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    const fetchUserData = async () => {
      const userId = id || currentUser?.id;
      
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if viewing own profile
        if (currentUser && ((!id && currentUser) || id === currentUser.id)) {
          setIsSelf(true);
        }
        
        // Get user profile info
        const { data: userData, error: userError } = await fetchWithRetry(async () => {
          return await supabase
            .from('user_roles')
            .select(`
              user_id,
              role
            `)
            .eq('user_id', userId)
            .single();
        });
          
        if (userError && userError.code !== 'PGRST116') { // Not found error
          throw userError;
        }
        
        // Get user's created events (if any)
        const { data: createdEvents, error: createdError } = await fetchWithRetry(async () => {
          return await supabase
            .from('events')
            .select(`
              id,
              title,
              date,
              price,
              cover_image,
              restaurants (name)
            `)
            .eq('user_id', userId)
            .eq('published', true)
            .order('date', { ascending: true });
        });
          
        if (createdError) {
          throw createdError;
        }
        
        // Get events user is attending via tickets
        const { data: tickets, error: ticketsError } = await fetchWithRetry(async () => {
          return await supabase
            .from('tickets')
            .select(`
              event_id,
              events (
                id,
                title,
                date,
                price,
                cover_image,
                restaurants (name)
              )
            `)
            .eq('user_id', userId);
        });
          
        if (ticketsError) {
          throw ticketsError;
        }
        
        // Format profile data
        setProfile({
          id: userId,
          role: userData?.role || 'user',
          created_at: new Date().toISOString() // Placeholder as we don't have actual creation date
        });
        
        // Format created events
        setEventsCreated(
          createdEvents?.map(event => ({
            id: event.id,
            title: event.title,
            date: event.date,
            price: event.price,
            cover_image: event.cover_image,
            restaurant_name: event.restaurants?.name || 'Unknown Restaurant'
          })) || []
        );
        
        // Format attended events
        const attendingEvents = tickets?.map(ticket => ({
          id: ticket.events.id,
          title: ticket.events.title,
          date: ticket.events.date,
          price: ticket.events.price,
          cover_image: ticket.events.cover_image,
          restaurant_name: ticket.events.restaurants?.name || 'Unknown Restaurant'
        })) || [];
        
        // Remove duplicates (in case user bought multiple tickets)
        const uniqueEvents = Array.from(
          new Map(attendingEvents.map(event => [event.id, event])).values()
        );
        
        setEventsAttending(uniqueEvents);
        
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message);
        toast({
          title: "Error loading profile",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id, toast, currentUser, navigate]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for UX
      // Clear any cached data
      if (id) {
        sessionStorage.removeItem(`user_profile_${id}`);
      } else if (currentUser) {
        sessionStorage.removeItem(`user_profile_${currentUser.id}`);
      }
      // Force re-fetch by updating state
      setError(null);
      setIsLoading(true);
      // The useEffect will run again and fetch fresh data
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <RetryAlert
            title="Failed to load profile"
            message={error}
            onRetry={handleRetry}
            isRetrying={isRetrying}
            severity="error"
          />
          <div className="text-center mt-8">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-6">The user profile you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/events")}>Browse Events</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-accent py-12">
        <div className="container-custom flex items-center">
          <Avatar className="h-20 w-20 mr-6">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              <UserRound className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {isSelf ? 'Your Profile' : 'User Profile'}
            </h1>
            <p className="text-gray-600">
              {profile.role === 'admin' ? 'Administrator' : 'Member'} · 
              {' Joined ' + new Date(profile.created_at).getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {/* Events Created Section */}
            <h2 className="text-2xl font-semibold mb-4">{isSelf ? 'Events You Created' : 'Events Created'}</h2>
            {eventsCreated.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
                {eventsCreated.map((event) => (
                  <Card key={event.id} className="overflow-hidden h-full">
                    <div 
                      className="h-40 bg-cover bg-center" 
                      style={{ 
                        backgroundImage: `url(${event.cover_image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0'})` 
                      }}
                    />
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-600">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="text-primary font-medium">${event.price}</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-4">{event.restaurant_name}</p>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => navigate(`/event/${event.id}`)}
                      >
                        View Event
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-accent rounded-lg mb-8">
                <p className="text-gray-600">
                  {isSelf ? "You haven't created any events yet." : "This user hasn't created any events yet."}
                </p>
                {isSelf && (
                  <Button
                    className="mt-4"
                    onClick={() => navigate("/dashboard/create-event")}
                  >
                    Create an Event
                  </Button>
                )}
              </div>
            )}

            {/* Events Attending Section */}
            <h2 className="text-2xl font-semibold mb-4">{isSelf ? 'Events You\'re Attending' : 'Events Attending'}</h2>
            {eventsAttending.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {eventsAttending.map((event) => (
                  <Card key={event.id} className="overflow-hidden h-full">
                    <div 
                      className="h-40 bg-cover bg-center" 
                      style={{ 
                        backgroundImage: `url(${event.cover_image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0'})` 
                      }}
                    />
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-600">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="text-primary font-medium">${event.price}</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-4">{event.restaurant_name}</p>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => navigate(`/event/${event.id}`)}
                      >
                        View Event
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-accent rounded-lg">
                <p className="text-gray-600">
                  {isSelf ? "You're not attending any events yet." : "This user isn't attending any events yet."}
                </p>
                {isSelf && (
                  <Button
                    className="mt-4"
                    onClick={() => navigate("/events")}
                  >
                    Browse Events
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">User Type</p>
                    <p className="capitalize">{profile.role || 'Member'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p>{new Date(profile.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Events Created</p>
                    <p>{eventsCreated.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Events Attending</p>
                    <p>{eventsAttending.length}</p>
                  </div>
                </div>
                
                {isSelf && (
                  <div className="mt-6">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/dashboard")}
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfilePage;
