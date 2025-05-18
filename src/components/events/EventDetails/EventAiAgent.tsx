
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { EventDetails } from '@/types/event';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface EventAiAgentProps {
  event: EventDetails;
  userTeamId?: string;
}

const EventAiAgent = ({ event, userTeamId }: EventAiAgentProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [hasTeams, setHasTeams] = useState<boolean>(false);
  
  // Check if event has teams
  useEffect(() => {
    const checkEventTeams = async () => {
      if (!event?.id) return;
      
      try {
        // Using any type to bypass TypeScript errors temporarily
        const { count, error } = await (supabase as any)
          .from('event_teams')
          .select('id', { count: 'exact' })
          .eq('event_id', event.id)
          .limit(1);
          
        if (error) throw error;
        
        setHasTeams(count > 0);
      } catch (error) {
        console.error('Error checking teams:', error);
      }
    };
    
    checkEventTeams();
  }, [event?.id]);
  
  // Load initial welcome message
  useEffect(() => {
    if (messages.length === 0 && event) {
      const welcomeMessage = {
        id: 'welcome',
        role: 'assistant' as const,
        content: `Welcome to ${event.title}! ${userTeamId ? "You're part of a team for this event. " : ""}How can I help you today?`
      };
      
      setMessages([welcomeMessage]);
    }
  }, [event, messages.length, userTeamId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: newMessage
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('event-ai-agent', {
        body: {
          message: newMessage,
          event_id: event.id,
          team_id: userTeamId,
          restaurant_id: event.restaurant?.id
        }
      });
      
      if (error) throw error;
      
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: data.message || "I'm sorry, I couldn't process your request."
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: "I'm sorry, there was an error processing your request. Please try again later."
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Assistant</CardTitle>
          <CardDescription>Get help and information about this event</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Please log in to chat with the event assistant
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle className="flex items-center">
          <span className="bg-primary h-2 w-2 rounded-full mr-2"></span>
          Event Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about the event, menu, or venue
          {hasTeams && " - or check your team status"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`px-4 py-2 rounded-lg max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isSending && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-lg bg-muted flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Thinking...
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-2">
        <div className="flex w-full items-center space-x-2">
          <Input 
            placeholder="Ask a question..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isSending}
            className="flex-1"
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventAiAgent;
