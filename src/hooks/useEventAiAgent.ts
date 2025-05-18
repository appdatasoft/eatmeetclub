
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventDetails } from '@/types/event';

interface AiAgentMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GameQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  targetPlayer: string;
}

interface TeamScore {
  id: string;
  name: string;
  score: number;
}

export const useEventAiAgent = (event?: EventDetails | null) => {
  const [messages, setMessages] = useState<AiAgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [teamScores, setTeamScores] = useState<TeamScore[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const { toast } = useToast();

  // Generate unique message ID
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

  // Generate a game question
  const generateQuestion = async (teamId: string, targetTeamId: string) => {
    if (!event?.id) return;
    
    try {
      setIsLoading(true);
      setIsAnswerSubmitted(false);
      
      const { data, error } = await supabase.functions.invoke('event-ai-agent', {
        body: {
          eventId: event.id,
          teamId,
          targetTeamId,
          action: 'generate-question'
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      setCurrentQuestion(data);
      return data;
    } catch (error) {
      console.error('Error generating question:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate a question. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Submit an answer to a game question
  const submitAnswer = async (teamId: string, isCorrect: boolean) => {
    if (!event?.id) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('event-ai-agent', {
        body: {
          eventId: event.id,
          teamId,
          action: 'update-score',
          content: isCorrect ? 'correct' : 'incorrect'
        }
      });

      if (error) throw error;
      
      setTeamScores(data.leaderboard || []);
      setIsAnswerSubmitted(true);
      
      toast({
        title: isCorrect ? 'Correct! 🎉' : 'Incorrect',
        description: data.feedback,
      });
      
      return data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit answer. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a social media post
  const generateSocialPost = async (context: string) => {
    if (!event?.id) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('event-ai-agent', {
        body: {
          eventId: event.id,
          action: 'generate-social-post',
          content: context
        }
      });

      if (error) throw error;
      
      return data.post;
    } catch (error) {
      console.error('Error generating social post:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate social post. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch team scores for an event
  const fetchTeamScores = async () => {
    if (!event?.id) return;
    
    try {
      // Using type assertion to bypass TypeScript errors
      const { data, error } = await (supabase as any)
        .from('event_teams')
        .select('id, name, score')
        .eq('event_id', event.id)
        .order('score', { ascending: false });
        
      if (error) throw error;
      
      // Safely cast the data to the expected type
      setTeamScores((data || []) as TeamScore[]);
      return data as TeamScore[];
    } catch (error) {
      console.error('Error fetching team scores:', error);
      return [];
    }
  };

  return {
    messages,
    isLoading,
    currentQuestion,
    teamScores,
    isAnswerSubmitted,
    fetchGreeting,
    sendMessage,
    generateQuestion,
    submitAnswer,
    generateSocialPost,
    fetchTeamScores
  };
};
