
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
