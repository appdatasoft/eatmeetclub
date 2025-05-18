
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEventAiAgent } from '@/hooks/useEventAiAgent';
import { EventDetails } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Send, Trophy, Users, BarChart2 } from 'lucide-react';

interface EventAiAgentProps {
  event: EventDetails;
  userTeamId?: string;
}

const EventAiAgent: React.FC<EventAiAgentProps> = ({ event, userTeamId }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [userTeams, setUserTeams] = useState<{id: string; name: string}[]>([]);
  const [opposingTeams, setOpposingTeams] = useState<{id: string; name: string}[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isViewingLeaderboard, setIsViewingLeaderboard] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
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
  } = useEventAiAgent(event);

  // Fetch greeting when component mounts
  useEffect(() => {
    if (event?.id && user?.id) {
      fetchGreeting(user.id, userTeamId);
      fetchTeamScores();
      fetchTeams();
    }
  }, [event?.id, user?.id, userTeamId]);

  // Fetch teams for the event
  const fetchTeams = async () => {
    if (!event?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('event_teams')
        .select('id, name')
        .eq('event_id', event.id);
        
      if (error) throw error;
      
      const teams = data || [];
      
      if (userTeamId) {
        const userTeam = teams.find(team => team.id === userTeamId);
        const otherTeams = teams.filter(team => team.id !== userTeamId);
        
        setUserTeams(userTeam ? [userTeam] : []);
        setOpposingTeams(otherTeams);
        
        if (otherTeams.length > 0) {
          setSelectedTeam(otherTeams[0].id);
        }
      } else {
        setUserTeams(teams);
        setOpposingTeams(teams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle message sending
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      sendMessage(message);
      setMessage('');
    }
  };

  // Handle generating a new question
  const handleGenerateQuestion = async () => {
    if (!userTeamId || !selectedTeam) return;
    
    await generateQuestion(userTeamId, selectedTeam);
  };

  // Handle submitting an answer
  const handleSubmitAnswer = async (isCorrect: boolean) => {
    if (!userTeamId) return;
    
    await submitAnswer(userTeamId, isCorrect);
  };

  // Generate a social post
  const handleGenerateSocialPost = async () => {
    const context = isViewingLeaderboard 
      ? `Team scores: ${teamScores.map(t => `${t.name}: ${t.score}`).join(', ')}`
      : currentQuestion 
        ? `Question: ${currentQuestion.question}` 
        : `Chat discussion about ${event.title}`;
        
    const post = await generateSocialPost(context);
    
    if (post) {
      // Copy to clipboard
      navigator.clipboard.writeText(post);
      toast({
        title: 'Social Post Generated',
        description: 'Post copied to clipboard!',
      });
    }
  };

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5" /> 
          <span>Event Assistant</span>
        </CardTitle>
        <Tabs defaultValue="chat" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="game">Team Game</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex-grow overflow-y-auto pb-0">
        <TabsContent value="chat" className="h-full flex flex-col mt-0">
          <div className="flex-grow overflow-y-auto p-1">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                        {msg.role === 'user' ? getInitials(user?.email || 'Me') : 'AI'}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className={`rounded-lg p-3 ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="game" className="space-y-4 mt-0">
          {userTeamId ? (
            <>
              {!currentQuestion ? (
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-medium mb-2">Generate a Question</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a question for an opponent from another team about their selected dish.
                    </p>
                    
                    {opposingTeams.length > 0 ? (
                      <>
                        <select 
                          className="w-full p-2 border rounded mb-4"
                          value={selectedTeam}
                          onChange={(e) => setSelectedTeam(e.target.value)}
                        >
                          {opposingTeams.map(team => (
                            <option key={team.id} value={team.id}>Team {team.name}</option>
                          ))}
                        </select>
                        
                        <Button onClick={handleGenerateQuestion} disabled={isLoading} className="w-full">
                          {isLoading ? 'Generating...' : 'Generate Question'}
                        </Button>
                      </>
                    ) : (
                      <p className="text-amber-600">No other teams available to challenge.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-medium mb-2">Question for {currentQuestion.targetPlayer}</h3>
                    <p className="text-md mb-4">{currentQuestion.question}</p>
                    
                    <div className="space-y-2 mb-4">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="font-medium">{String.fromCharCode(97 + index)})</span>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                    
                    {!isAnswerSubmitted ? (
                      <div className="flex justify-between gap-2 mt-6">
                        <Button 
                          onClick={() => handleSubmitAnswer(false)} 
                          variant="outline" 
                          className="flex-1"
                          disabled={isLoading}
                        >
                          Incorrect
                        </Button>
                        <Button 
                          onClick={() => handleSubmitAnswer(true)} 
                          className="flex-1"
                          disabled={isLoading}
                        >
                          Correct
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-4 text-center">
                        <p className="mb-2 font-medium">Correct answer: {String.fromCharCode(97 + currentQuestion.correctAnswer)}</p>
                        <Button onClick={handleGenerateQuestion} disabled={isLoading}>
                          {isLoading ? 'Generating...' : 'Next Question'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-8 bg-muted rounded-lg">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Not In a Team Yet</h3>
              <p className="text-muted-foreground mb-4">You need to be assigned to a team before you can play the team game.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="scores" className="mt-0">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Team Leaderboard
              </h3>
              <Button variant="outline" size="sm" onClick={() => fetchTeamScores()}>
                Refresh
              </Button>
            </div>
            
            {teamScores.length > 0 ? (
              <div className="space-y-3">
                {teamScores.map((team, index) => (
                  <div key={team.id} className="flex items-center justify-between bg-muted p-3 rounded">
                    <div className="flex items-center gap-3">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-300' : 
                        index === 2 ? 'bg-amber-700' : 'bg-muted-foreground'
                      } text-white font-medium`}>
                        {index + 1}
                      </span>
                      <span>Team {team.name}</span>
                    </div>
                    <span className="font-bold">{team.score}</span>
                  </div>
                ))}
                
                <Button 
                  onClick={handleGenerateSocialPost}
                  variant="outline"
                  className="w-full mt-4"
                  disabled={isLoading}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Generate Leaderboard Post
                </Button>
              </div>
            ) : (
              <div className="text-center p-8 bg-muted bg-opacity-50 rounded-lg">
                <p className="text-muted-foreground">No scores available yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </CardContent>

      {activeTab === 'chat' && (
        <CardFooter className="pt-3">
          <form onSubmit={handleSendMessage} className="w-full flex gap-2">
            <Textarea
              placeholder="Ask me anything about this event..."
              className="min-h-9 flex-grow resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit" size="icon" disabled={isLoading || !message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      )}
    </Card>
  );
};

export default EventAiAgent;
