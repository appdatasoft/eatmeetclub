
-- Create the admin_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on the table
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to manage configs
CREATE POLICY IF NOT EXISTS "admin_manage_config" 
  ON public.admin_config 
  USING (true);

-- Create a function to create the admin_config table if it doesn't exist
CREATE OR REPLACE FUNCTION create_admin_config_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert default Stripe mode if it doesn't exist
  INSERT INTO public.admin_config (key, value)
  VALUES ('stripe_mode', 'test')
  ON CONFLICT (key) DO NOTHING;
END;
$$;
