
-- Create enum for team status
CREATE TYPE public.team_status AS ENUM (
  'active', 
  'inactive'
);

-- Create table for event teams
CREATE TABLE public.event_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  status team_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create table for team members
CREATE TABLE public.event_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE, 
  team_id UUID NOT NULL REFERENCES public.event_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Create table for menu selections
CREATE TABLE public.event_menu_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.restaurant_menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(event_id, user_id, menu_item_id)
);

-- Create table for game questions
CREATE TABLE public.event_game_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  asking_team_id UUID NOT NULL REFERENCES public.event_teams(id) ON DELETE CASCADE,
  target_team_id UUID NOT NULL REFERENCES public.event_teams(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  was_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE
);

-- Create table for social posts
CREATE TABLE public.event_social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  context TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Function to increment team score
CREATE OR REPLACE FUNCTION public.increment_team_score(
  p_event_id UUID,
  p_team_id UUID,
  p_points INTEGER
) RETURNS void AS $$
BEGIN
  UPDATE public.event_teams
  SET score = score + p_points
  WHERE id = p_team_id AND event_id = p_event_id;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE public.event_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_menu_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_social_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_teams
CREATE POLICY "Allow read access to everyone for event_teams"
  ON public.event_teams
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert of event teams to authenticated users"
  ON public.event_teams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their event teams"
  ON public.event_teams
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_teams.event_id
      AND events.user_id = auth.uid()
    )
  );

-- RLS policies for event_team_members
CREATE POLICY "Allow read access to everyone for event_team_members"
  ON public.event_team_members
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert of team members to authenticated users"
  ON public.event_team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to update their own team membership"
  ON public.event_team_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS policies for event_menu_selections
CREATE POLICY "Allow users to view menu selections"
  ON public.event_menu_selections
  FOR SELECT
  USING (true);

CREATE POLICY "Allow users to insert their menu selections"
  ON public.event_menu_selections
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to update their menu selections"
  ON public.event_menu_selections
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Allow users to delete their menu selections"
  ON public.event_menu_selections
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS policies for event_game_questions
CREATE POLICY "Allow read access to game questions"
  ON public.event_game_questions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert of game questions"
  ON public.event_game_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update of game questions"
  ON public.event_game_questions
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS policies for event_social_posts
CREATE POLICY "Allow read access to social posts"
  ON public.event_social_posts
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert of social posts"
  ON public.event_social_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to update their own social posts"
  ON public.event_social_posts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);
