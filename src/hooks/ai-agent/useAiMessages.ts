
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AiAgentMessage } from './types';
import { generateMessageId } from './utils';
import { EventDetails } from '@/types/event';

export const useAiMessages = (event?: EventDetails | null) => {
  const [messages, setMessages] = useState<AiAgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch a greeting from the AI agent
  const fetchGreeting = async (userId?: string, teamId?: string) => {
    if (!event?.id) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('event-ai-agent', {
        body: {
          eventId: event.id,
          userId,
          teamId,
          action: 'greet'
        }
      });

      if (error) throw error;

      // Add AI message to the chat
      const aiMessage = {
        id: generateMessageId(),
        role: 'assistant' as const,
        content: data.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      return data.message;
    } catch (error) {
      console.error('Error fetching greeting:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch AI greeting. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send a chat message to the AI agent
  const sendMessage = async (content: string) => {
    if (!event?.id || !content.trim()) return;

    // Add user message to the chat
    const userMessage = {
      id: generateMessageId(),
      role: 'user' as const,
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('event-ai-agent', {
        body: {
          eventId: event.id,
          action: 'chat',
          content
        }
      });

      if (error) throw error;

      // Add AI message to the chat
      const aiMessage = {
        id: generateMessageId(),
        role: 'assistant' as const,
        content: data.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    fetchGreeting,
    sendMessage
  };
};
