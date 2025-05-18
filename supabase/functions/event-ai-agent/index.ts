
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define types for request bodies
interface EventAgentRequest {
  eventId: string;
  userId?: string;
  action: 'greet' | 'chat' | 'generate-question' | 'update-score' | 'generate-social-post';
  content?: string;
  teamId?: string;
  targetTeamId?: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  restaurant: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    description: string;
  };
}

// Create system prompt based on event data
const createSystemPrompt = async (eventId: string): Promise<string> => {
  try {
    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        id, title, description, date, time,
        restaurants (
          name, address, city, state, zipcode, description
        )
      `)
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;
    
    // Fetch menu items for the restaurant
    const { data: menuItems, error: menuError } = await supabase
      .from('restaurant_menu_items')
      .select('name, description, price')
      .eq('restaurant_id', event.restaurants.id);
      
    if (menuError) throw menuError;
    
    // Fetch registered attendees/teams
    const { data: teams, error: teamsError } = await supabase
      .from('event_teams')
      .select('id, name, members:event_team_members(user_id, name)')
      .eq('event_id', eventId);
      
    if (teamsError) throw teamsError;

    // Create system prompt
    return `
You are an AI event assistant for an EatMeetClub event titled "${event.title}" taking place on ${event.date} at ${event.time}.

EVENT DETAILS:
- Description: ${event.description}
- Location: ${event.restaurants.name} at ${event.restaurants.address}, ${event.restaurants.city}, ${event.restaurants.state} ${event.restaurants.zipcode}
- Restaurant information: ${event.restaurants.description}

MENU ITEMS:
${menuItems.map(item => `- ${item.name}: ${item.description || 'No description'} ($${item.price})`).join('\n')}

TEAMS:
${teams.map(team => `- Team ${team.name}: ${team.members.map((m: any) => m.name).join(', ')}`).join('\n')}

GAME RULES:
1. Attendees are divided into teams
2. Teams take turns asking questions to members of opposing teams
3. Questions are based on the food dishes that attendees selected
4. The person who answers correctly earns points for their team
5. The team with the most points at the end wins

YOUR ROLE:
- Be friendly, enthusiastic, and helpful
- Provide accurate information about the event, restaurant, and menu
- Help facilitate the team game by generating fair and fun questions
- Generate engaging social media content when requested
- Track scores and provide updates on team standings
`;
  } catch (error) {
    console.error("Error creating system prompt:", error);
    return `You are an AI assistant for EatMeetClub. You help with events, but some event data couldn't be loaded right now.`;
  }
};

// Function to generate a greeting for a user
const generateGreeting = async (eventId: string, userId?: string, teamId?: string): Promise<string> => {
  try {
    // Get system prompt
    const systemPrompt = await createSystemPrompt(eventId);
    
    // Get user information and team assignment
    let userInfo = "a guest";
    let teamName = "";
    let menuSelections = "";
    
    if (userId) {
      // Fetch user profile info
      const { data: user } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();
      
      if (user) {
        userInfo = `${user.first_name} ${user.last_name}`;
      }
      
      // Fetch team info
      if (teamId) {
        const { data: team } = await supabase
          .from('event_teams')
          .select('name')
          .eq('id', teamId)
          .single();
          
        if (team) {
          teamName = team.name;
        }
      } else {
        // Get team assignment from team members table
        const { data: teamMember } = await supabase
          .from('event_team_members')
          .select('team:event_teams(id, name)')
          .eq('user_id', userId)
          .eq('event_id', eventId)
          .single();
          
        if (teamMember?.team) {
          teamId = teamMember.team.id;
          teamName = teamMember.team.name;
        }
      }
      
      // Fetch menu selections
      const { data: selections } = await supabase
        .from('event_menu_selections')
        .select('menu_item:restaurant_menu_items(name)')
        .eq('user_id', userId)
        .eq('event_id', eventId);
        
      if (selections && selections.length > 0) {
        menuSelections = selections.map((s: any) => s.menu_item.name).join(", ");
      }
    }
    
    // Call OpenAI to generate the greeting
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Generate a friendly greeting for ${userInfo} who just opened the event page. ${
              teamName ? `They are assigned to Team ${teamName}.` : "They haven't been assigned to a team yet."
            } ${
              menuSelections ? `They have selected these menu items: ${menuSelections}.` : "They haven't selected any menu items yet."
            } Include: 
            1. A welcome message
            2. Their team name (if assigned)
            3. A brief explanation of how the team game works
            4. A mention of their menu selections (if any)
            
            Keep it under 150 words, friendly and excited!`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error("Error generating greeting:", error);
    return "Welcome to the event! I'm your AI assistant. I'm having trouble loading your personalized information right now, but I'm here to help with any questions about the event.";
  }
};

// Function to handle chat messages
const handleChatMessage = async (eventId: string, content: string): Promise<string> => {
  try {
    // Get system prompt
    const systemPrompt = await createSystemPrompt(eventId);
    
    // Call OpenAI to respond to chat
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error("Error handling chat message:", error);
    return "I'm sorry, I'm having trouble responding to your message right now. Please try again in a moment.";
  }
};

// Function to generate a game question
const generateGameQuestion = async (eventId: string, teamId: string, targetTeamId: string): Promise<any> => {
  try {
    // Get system prompt
    const systemPrompt = await createSystemPrompt(eventId);
    
    // Get information about the target team member and their dish selections
    const { data: targetTeamMembers } = await supabase
      .from('event_team_members')
      .select('user_id, name')
      .eq('team_id', targetTeamId);
      
    if (!targetTeamMembers || targetTeamMembers.length === 0) {
      throw new Error("No members found in the target team");
    }
    
    // Randomly select a team member
    const randomMember = targetTeamMembers[Math.floor(Math.random() * targetTeamMembers.length)];
    
    // Get their menu selection
    const { data: menuSelections } = await supabase
      .from('event_menu_selections')
      .select('menu_item:restaurant_menu_items(id, name, description)')
      .eq('user_id', randomMember.user_id)
      .eq('event_id', eventId);
    
    let dishInfo = "food in general";
    if (menuSelections && menuSelections.length > 0) {
      const randomDish = menuSelections[Math.floor(Math.random() * menuSelections.length)];
      dishInfo = `the dish "${randomDish.menu_item.name}" (${randomDish.menu_item.description || 'no description available'})`;
    }
    
    // Call OpenAI to generate a question
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Generate a fun, multiple-choice trivia question about ${dishInfo}. The question should be related to food, cuisine, ingredients, or cultural aspects of the dish. Include 4 options labeled a, b, c, and d, and indicate the correct answer. Format as JSON with these fields: question, options (array of 4 strings), correctAnswer (0-3 index of correct option), targetPlayer (string with player name).`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })
    });
    
    const data = await response.json();
    const questionData = JSON.parse(data.choices[0].message.content);
    
    // Add the target player name
    questionData.targetPlayer = randomMember.name;
    
    return questionData;
    
  } catch (error) {
    console.error("Error generating game question:", error);
    return {
      error: "Failed to generate question",
      message: error.message
    };
  }
};

// Function to update score and generate feedback
const updateScore = async (eventId: string, teamId: string, correct: boolean): Promise<any> => {
  try {
    const points = correct ? 50 : 0;
    
    // Update team score in database
    await supabase.rpc('increment_team_score', {
      p_event_id: eventId,
      p_team_id: teamId,
      p_points: points
    });
    
    // Get updated team scores
    const { data: scores } = await supabase
      .from('event_teams')
      .select('id, name, score')
      .eq('event_id', eventId)
      .order('score', { ascending: false });
      
    // Generate feedback message
    let feedbackMessage = correct ? 
      "Correct answer! 🎉 You've earned 50 points for your team!" : 
      "That's not quite right. No points this time, but keep trying!";
      
    return {
      success: true,
      feedback: feedbackMessage,
      points,
      leaderboard: scores
    };
    
  } catch (error) {
    console.error("Error updating score:", error);
    return {
      error: "Failed to update score",
      message: error.message
    };
  }
};

// Function to generate a social media post
const generateSocialPost = async (eventId: string, context: string): Promise<string> => {
  try {
    // Get system prompt with event info
    const systemPrompt = await createSystemPrompt(eventId);
    
    // Call OpenAI to generate a social post
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Generate an engaging, short social media post (under 100 characters) for this EatMeetClub event based on this context: ${context}. Include relevant hashtags like #EatMeetClub.`
          }
        ],
        temperature: 0.8,
        max_tokens: 150
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error("Error generating social post:", error);
    return "Exciting times at our EatMeetClub event! #EatMeetClub #FoodieAdventure";
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId, userId, action, content, teamId, targetTeamId } = await req.json() as EventAgentRequest;
    
    if (!eventId) {
      throw new Error("Event ID is required");
    }
    
    let responseData;
    
    switch (action) {
      case 'greet':
        responseData = { message: await generateGreeting(eventId, userId, teamId) };
        break;
        
      case 'chat':
        if (!content) {
          throw new Error("Content is required for chat action");
        }
        responseData = { message: await handleChatMessage(eventId, content) };
        break;
        
      case 'generate-question':
        if (!teamId || !targetTeamId) {
          throw new Error("Team IDs are required for question generation");
        }
        responseData = await generateGameQuestion(eventId, teamId, targetTeamId);
        break;
        
      case 'update-score':
        if (!teamId || content === undefined) {
          throw new Error("Team ID and correct/incorrect status are required");
        }
        responseData = await updateScore(eventId, teamId, content === 'correct');
        break;
        
      case 'generate-social-post':
        if (!content) {
          throw new Error("Context is required for social post generation");
        }
        responseData = { post: await generateSocialPost(eventId, content) };
        break;
        
      default:
        throw new Error("Invalid action");
    }
    
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error("Error in event-ai-agent function:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
