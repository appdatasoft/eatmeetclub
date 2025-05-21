
-- Create table for user targeting
CREATE TABLE IF NOT EXISTS public.user_feature_targeting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES public.feature_flags(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, feature_id)
);

-- Enable RLS on the new table
ALTER TABLE public.user_feature_targeting ENABLE ROW LEVEL SECURITY;

-- Add policies for user feature targeting
CREATE POLICY "Admins can manage user feature targeting"
  ON public.user_feature_targeting
  USING (is_admin(auth.uid()));

-- Everyone can read their own feature targeting
CREATE POLICY "Users can read their own feature targeting"
  ON public.user_feature_targeting
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add timestamps trigger
CREATE TRIGGER update_user_feature_targeting_timestamp
BEFORE UPDATE ON public.user_feature_targeting
FOR EACH ROW
EXECUTE FUNCTION update_feature_flag_timestamp();
