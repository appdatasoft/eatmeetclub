import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import RetryAlert from "@/components/ui/RetryAlert";
import MainLayout from "@/components/layout/MainLayout";
import { fetchWithRetry } from "@/utils/fetchUtils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Skeleton } from "@/components/ui/skeleton";
import { createSessionCache } from "@/utils/fetch/sessionStorageCache";

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
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [eventsCreated, setEventsCreated] = useState<UserEvent[]>([]);
  const [eventsAttending, setEventsAttending] = useState<UserEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelf, setIsSelf] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);

  // Wait for auth to resolve before proceeding
  useEffect(() => {
    if (authLoading) return;
    
    // If on /profile route with no ID, use the current user's ID
    // or redirect to login if not logged in
    if (!id && !currentUser) {
      console.log("No user found, redirecting to login");
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    const fetchUserData = async () => {
      const userId = id || currentUser?.id;
      
      if (!userId) {
        console.log("No user ID available");
        return;
      }
      
      console.log("Fetching profile data for user ID:", userId);
      setIsLoading(true);
      setError(null);
      
      // Create a session cache
      const cacheKey = `user_profile_${userId}_${fetchCount}`;
      const cache = createSessionCache<{
        profile: UserProfile;
        eventsCreated: UserEvent[];
        eventsAttending: UserEvent[];
        isSelf: boolean;
      }>(cacheKey, 5 * 60 * 1000, { staleWhileRevalidate: true });
      
      // Try to get cached data
      const cachedData = cache.get();
      if (cachedData) {
        console.log("Using cached profile data");
        setProfile(cachedData.profile);
        setEventsCreated(cachedData.eventsCreated);
        setEventsAttending(cachedData.eventsAttending);
        setIsSelf(cachedData.isSelf);
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if viewing own profile
        const isSelfProfile = !!currentUser && ((!id && !!currentUser) || id === currentUser.id);
        if (isSelfProfile) {
          console.log("User is viewing their own profile");
          setIsSelf(true);
        }
        
        // Use fetchWithRetry to get user role
        const userData = await fetchWithRetry(async () => {
          // Get user profile info - user role
          const { data, error } = await supabase
            .from('user_roles')
            .select('role, user_id')
            .eq('user_id', userId)
            .single();
            
          if (error && error.code !== 'PGRST116') { // Not found error
            throw error;
          }
          
          return data;
        });
        
        // Get user's created events (if any) with improved error handling
        const createdEventsResponse = await fetchWithRetry(async () => {
          try {
            const response = await supabase
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
              
            if (response.error) {
              console.error("Error in events query:", response.error);
              throw response.error;
            }
            
            return response;
          } catch (err) {
            console.error("Error in created events fetch:", err);
            throw err;
          }
        });
        
        const { data: createdEvents, error: createdError } = createdEventsResponse;
          
        if (createdError) {
          console.error("Error fetching created events:", createdError);
          throw createdError;
        }
        
        // Get events user is attending via tickets with improved error handling
        const ticketsResponse = await fetchWithRetry(async () => {
          try {
            const response = await supabase
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
              
            if (response.error) {
              console.error("Error in tickets query:", response.error);
              throw response.error;
            }
            
            return response;
          } catch (err) {
            console.error("Error in tickets fetch:", err);
            throw err;
          }
        });
        
        const { data: tickets, error: ticketsError } = ticketsResponse;
          
        if (ticketsError) {
          console.error("Error fetching tickets:", ticketsError);
          throw ticketsError;
        }
        
        console.log("Fetched data:", { userData, createdEvents, tickets });
        
        // Format profile data
        const profileData = {
          id: userId,
          role: userData?.role || 'user',
          created_at: new Date().toISOString() // Placeholder as we don't have actual creation date
        };
        
        setProfile(profileData);
        
        // Format created events
        const formattedCreatedEvents = createdEvents?.map(event => ({
          id: event.id,
          title: event.title,
          date: event.date,
          price: event.price,
          cover_image: event.cover_image,
          restaurant_name: event.restaurants?.name || 'Unknown Restaurant'
        })) || [];
        
        setEventsCreated(formattedCreatedEvents);
        
        // Format attended events
        const attendingEvents = tickets?.map(ticket => {
          // Skip if events is null (can happen if event was deleted)
          if (!ticket.events) return null;
          
          return {
            id: ticket.events.id,
            title: ticket.events.title,
            date: ticket.events.date,
            price: ticket.events.price,
            cover_image: ticket.events.cover_image,
            restaurant_name: ticket.events.restaurants?.name || 'Unknown Restaurant'
          };
        }).filter(Boolean) as UserEvent[];
        
        // Remove duplicates (in case user bought multiple tickets)
        const uniqueEvents = Array.from(
          new Map(attendingEvents.map(event => [event.id, event])).values()
        );
        
        setEventsAttending(uniqueEvents);
        
        // Cache the fetched data
        cache.set({
          profile: profileData,
          eventsCreated: formattedCreatedEvents,
          eventsAttending: uniqueEvents,
          isSelf: isSelfProfile
        });
        
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile data");
        toast({
          title: "Error loading profile",
          description: err.message || "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id, toast, currentUser, navigate, authLoading, fetchCount]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for UX
      
      // Force re-fetch by incrementing the fetch counter
      setFetchCount(prev => prev + 1);
      
      // Clear errors and set loading state
      setError(null);
      setIsLoading(true);
    } finally {
      setIsRetrying(false);
    }
  };

  // Render loading state
  if (authLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12 flex items-center justify-center">
          <LoadingSpinner size="large" text="Loading authentication..." />
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    // ... keep existing code (loading skeleton)
    return (
      <MainLayout>
        <div className="bg-accent py-12">
          <div className="container-custom">
            <div className="flex items-center">
              <Skeleton className="h-20 w-20 rounded-full mr-6" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">Loading Events...</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-1/2 mb-6" />
                      <Skeleton className="h-9 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i}>
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
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
