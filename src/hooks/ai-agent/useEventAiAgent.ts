
import { EventDetails } from '@/types/event';
import { useAiMessages } from './useAiMessages';
import { useAiGame } from './useAiGame';
import { useAiContent } from './useAiContent';
import { EventAiAgentResult } from './types';

export const useEventAiAgent = (event?: EventDetails | null): EventAiAgentResult => {
  const { 
    messages, 
    isLoading: messagesLoading,
    fetchGreeting,
    sendMessage 
  } = useAiMessages(event);

  const { 
    currentQuestion,
    teamScores,
    isAnswerSubmitted,
    isLoading: gameLoading,
    generateQuestion,
    submitAnswer,
    fetchTeamScores
  } = useAiGame(event);

  const {
    isLoading: contentLoading,
    generateSocialPost
  } = useAiContent(event);

  // Combine loading states
  const isLoading = messagesLoading || gameLoading || contentLoading;

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
