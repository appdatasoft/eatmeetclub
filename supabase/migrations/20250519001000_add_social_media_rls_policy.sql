
-- Add RLS policy for social_media_connections table

-- Enable RLS on the table (if not already enabled)
ALTER TABLE public.social_media_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for owner access to their own connections
CREATE POLICY "Users can manage their own social media connections" 
ON public.social_media_connections
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins full access to all social media connections
CREATE POLICY "Admins can access all social media connections"
ON public.social_media_connections
FOR ALL
TO authenticated
USING (
  (SELECT is_admin(auth.uid()))
)
WITH CHECK (
  (SELECT is_admin(auth.uid()))
);

-- Add columns for OAuth tokens and additional metadata, if needed
ALTER TABLE public.social_media_connections 
ADD COLUMN IF NOT EXISTS oauth_token TEXT,
ADD COLUMN IF NOT EXISTS oauth_token_secret TEXT,
ADD COLUMN IF NOT EXISTS oauth_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS meta_data JSONB DEFAULT '{}'::jsonb;

-- Create update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_social_media_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_media_connections_timestamp
BEFORE UPDATE ON public.social_media_connections
FOR EACH ROW
EXECUTE PROCEDURE public.update_social_media_connections_updated_at();
