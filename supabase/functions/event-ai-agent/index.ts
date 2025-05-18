
// Follow Deno and Supabase Edge Functions format
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Define types
interface RequestBody {
  message: string;
  event_id: string;
  team_id?: string;
  restaurant_id?: string;
}

interface EventInfo {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
  };
}

interface TeamInfo {
  id: string;
  name: string;
  score: number;
  members: Array<{
    id: string;
    name: string;
  }>;
}

// Handle requests
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRole) {
      throw new Error('Missing environment variables')
    }
    
    // Create Supabase client
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRole
    )
    
    // Get the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Parse the request body
    const body = await req.json() as RequestBody
    const { message, event_id, team_id, restaurant_id } = body
    
    if (!message || !event_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get event info
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from('events')
      .select(`
        id, 
        title, 
        description, 
        date,
        time,
        restaurant:restaurant_id (
          id, 
          name, 
          address, 
          city, 
          state, 
          zipcode
        )
      `)
      .eq('id', event_id)
      .single()
    
    if (eventError) {
      console.error('Error fetching event info:', eventError)
      throw new Error('Failed to fetch event info')
    }
    
    // Get team info if team_id is provided
    let teamData = null
    if (team_id) {
      const { data: teamInfo, error: teamError } = await supabaseAdmin
        .from('event_teams')
        .select(`
          id, 
          name,
          score,
          members:event_team_members (
            id, 
            name
          )
        `)
        .eq('id', team_id)
        .eq('event_id', event_id)
        .single()
      
      if (!teamError) {
        teamData = teamInfo
      }
    }
    
    // Get user's menu selections for this event
    const { data: menuSelections, error: menuError } = await supabaseAdmin
      .from('event_menu_selections')
      .select(`
        id,
        menu_item:menu_item_id (
          id, 
          name,
          description,
          price
        )
      `)
      .eq('event_id', event_id)
      .eq('user_id', user.id)
    
    // Basic response generation logic
    let response = ''
    
    // Handle different types of queries
    if (message.toLowerCase().includes('team') || message.toLowerCase().includes('score')) {
      if (teamData) {
        response = `Your team is "${teamData.name}" with a current score of ${teamData.score} points. ` +
          `The team has ${teamData.members.length} members.`
      } else {
        response = `You're not currently assigned to a team for this event. ` +
          `You can join a team by asking the event organizer.`
      }
    } else if (message.toLowerCase().includes('menu') || message.toLowerCase().includes('food') || 
              message.toLowerCase().includes('dish') || message.toLowerCase().includes('eat')) {
      if (menuSelections && menuSelections.length > 0) {
        const itemsList = menuSelections.map(selection => selection.menu_item.name).join(', ')
        response = `For this event, you've selected the following menu items: ${itemsList}.`
      } else {
        response = `You haven't selected any menu items for this event yet. ` +
          `You can select items through the event page menu selection option.`
      }
    } else if (message.toLowerCase().includes('where') || message.toLowerCase().includes('location') ||
              message.toLowerCase().includes('address') || message.toLowerCase().includes('venue')) {
      response = `This event takes place at ${eventData.restaurant.name}, located at ` +
        `${eventData.restaurant.address}, ${eventData.restaurant.city}, ` +
        `${eventData.restaurant.state} ${eventData.restaurant.zipcode}.`
    } else if (message.toLowerCase().includes('when') || message.toLowerCase().includes('time') ||
              message.toLowerCase().includes('date')) {
      response = `This event is scheduled for ${eventData.date} at ${eventData.time}.`
    } else {
      // Default response about the event
      response = `${eventData.title} is an event at ${eventData.restaurant.name}. ` +
        `${eventData.description || 'No additional details are available.'} ` +
        `Feel free to ask me specific questions about the venue, menu, or schedule!`
    }
    
    return new Response(
      JSON.stringify({ 
        message: response,
        event: eventData,
        team: teamData,
        menu_selections: menuSelections || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
