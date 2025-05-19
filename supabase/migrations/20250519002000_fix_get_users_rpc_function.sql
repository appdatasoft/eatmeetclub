
-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_users_for_admin();

-- Create a new RPC function to fetch users safely for admin use with correct return types
CREATE OR REPLACE FUNCTION public.get_users_for_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  raw_user_meta_data JSONB
)
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the user requesting has admin privileges
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;

  -- Return user data
  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    au.raw_user_meta_data
  FROM 
    auth.users au
  LIMIT 50;
END;
$$;

-- Add comment to explain the function
COMMENT ON FUNCTION public.get_users_for_admin IS 'Safely retrieves users for admin dashboard. Only accessible by authenticated admin users.';
