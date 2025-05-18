
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GameQuestion, TeamScore } from './types';
import { EventDetails } from '@/types/event';

export const useAiGame = (event?: EventDetails | null) => {
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [teamScores, setTeamScores] = useState<TeamScore[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Generate a game question
  const generateQuestion = async (teamId: string, targetTeamId: string) => {
    if (!event?.id) return null;
    
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

  // Fetch team scores for an event
  const fetchTeamScores = async () => {
    if (!event?.id) return [];
    
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
    currentQuestion,
    teamScores,
    isAnswerSubmitted,
    isLoading,
    generateQuestion,
    submitAnswer,
    fetchTeamScores
  };
};
