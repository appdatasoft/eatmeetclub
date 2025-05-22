
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventAiAgent } from '../useEventAiAgent';
import { useEventAiAgent as useEventAiAgentOriginal } from '../ai-agent';

// Mock the original implementation
vi.mock('../ai-agent', () => ({
  useEventAiAgent: vi.fn()
}));

describe('useEventAiAgent hook', () => {
  const mockEvent = { id: 'event-123', title: 'Test Event' };
  const mockResult = {
    messages: [{ id: '1', role: 'assistant', content: 'Hello', timestamp: new Date() }],
    isLoading: false,
    currentQuestion: null,
    teamScores: [],
    isAnswerSubmitted: false,
    fetchGreeting: vi.fn(),
    sendMessage: vi.fn(),
    generateQuestion: vi.fn(),
    submitAnswer: vi.fn(),
    generateSocialPost: vi.fn(),
    fetchTeamScores: vi.fn()
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (useEventAiAgentOriginal as any).mockReturnValue(mockResult);
  });

  it('should re-export the hook from ai-agent module', () => {
    const { result } = renderHook(() => useEventAiAgent(mockEvent));
    
    // Verify that the re-exported hook is called with the correct parameters
    expect(useEventAiAgentOriginal).toHaveBeenCalledWith(mockEvent);
    
    // Verify that the result is correctly passed through
    expect(result.current).toEqual(mockResult);
  });

  it('should handle null event', () => {
    renderHook(() => useEventAiAgent(null));
    
    expect(useEventAiAgentOriginal).toHaveBeenCalledWith(null);
  });

  it('should handle undefined event', () => {
    renderHook(() => useEventAiAgent(undefined));
    
    expect(useEventAiAgentOriginal).toHaveBeenCalledWith(undefined);
  });
});
