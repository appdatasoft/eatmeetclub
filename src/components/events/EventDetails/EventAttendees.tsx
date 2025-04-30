
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

interface Attendee {
  id: string;
  user_id: string;
  quantity: number;
  email?: string;
  name?: string;
}

interface EventAttendeesProps {
  eventId: string;
}

const EventAttendees: React.FC<EventAttendeesProps> = ({ eventId }) => {
  const { isAdmin } = useAuth();
  
  const { data: attendees, isLoading } = useQuery({
    queryKey: ['eventAttendees', eventId],
    queryFn: async () => {
      const { data: ticketsData, error } = await supabase
        .from('tickets')
        .select(`
          id,
          user_id,
          quantity
        `)
        .eq('event_id', eventId)
        .eq('payment_status', 'completed');
        
      if (error) throw error;
      
      // If admin, enrich with user info
      if (isAdmin && ticketsData.length > 0) {
        // We can't directly query auth.users, so we'll use a simpler approach
        // Just use the first part of the user_id as a display name
        const enrichedTickets: Attendee[] = ticketsData.map(ticket => ({
          ...ticket,
          name: ticket.user_id.substring(0, 8) // Use first 8 chars of user ID as name
        }));
        
        return enrichedTickets;
      }
      
      return ticketsData as Attendee[];
    },
    enabled: !!eventId
  });
  
  const totalAttendees = attendees?.reduce((sum, attendee) => sum + attendee.quantity, 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Attendees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Attendees ({totalAttendees})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendees && attendees.length > 0 ? (
          <div className="space-y-3">
            {isAdmin ? (
              // Detailed view for admins
              attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>
                        {attendee.name ? attendee.name.charAt(0).toUpperCase() : attendee.user_id.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{attendee.name || attendee.user_id.substring(0, 8)}</span>
                  </div>
                  <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                    {attendee.quantity} {attendee.quantity === 1 ? 'ticket' : 'tickets'}
                  </span>
                </div>
              ))
            ) : (
              // Simple view for non-admins, just show avatars
              <div className="flex flex-wrap items-center gap-2">
                {attendees.map((attendee) => (
                  <Avatar key={attendee.id} className="h-8 w-8 border">
                    <AvatarFallback>
                      {attendee.user_id.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <div className="text-sm text-muted-foreground ml-2">
                  {totalAttendees} {totalAttendees === 1 ? 'person' : 'people'} attending
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            No attendees yet. Be the first to join!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default EventAttendees;
