
import { EventDetails } from '@/types/event';

export interface AiAgentMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GameQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  targetPlayer: string;
}

export interface TeamScore {
  id: string;
  name: string;
  score: number;
}

export interface EventAiAgentResult {
  messages: AiAgentMessage[];
  isLoading: boolean;
  currentQuestion: GameQuestion | null;
  teamScores: TeamScore[];
  isAnswerSubmitted: boolean;
  fetchGreeting: (userId?: string, teamId?: string) => Promise<string | undefined>;
  sendMessage: (content: string) => Promise<void>;
  generateQuestion: (teamId: string, targetTeamId: string) => Promise<GameQuestion | null>;
  submitAnswer: (teamId: string, isCorrect: boolean) => Promise<any>;
  generateSocialPost: (context: string) => Promise<string | null>;
  fetchTeamScores: () => Promise<TeamScore[]>;
}
