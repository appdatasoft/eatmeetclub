
-- Create RPC function for getting user feature targeting
CREATE OR REPLACE FUNCTION public.get_user_feature_targeting(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  feature_key TEXT,
  is_enabled BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uft.id,
    ff.feature_key,
    uft.is_enabled
  FROM 
    public.user_feature_targeting uft
    JOIN public.feature_flags ff ON ff.id = uft.feature_id
  WHERE 
    uft.user_id = user_uuid;
END;
$$;

-- Create RPC function for getting all user feature targeting
CREATE OR REPLACE FUNCTION public.get_all_user_feature_targeting()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  feature_id UUID,
  is_enabled BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user requesting has admin privileges
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;

  RETURN QUERY
  SELECT 
    uft.id,
    uft.user_id,
    uft.feature_id,
    uft.is_enabled
  FROM 
    public.user_feature_targeting uft;
END;
$$;

-- Create RPC function for setting user feature targeting
CREATE OR REPLACE FUNCTION public.set_user_feature_targeting(
  user_uuid UUID,
  feature_uuid UUID,
  enabled BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_id UUID;
BEGIN
  -- Check if the user requesting has admin privileges
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;

  -- Check if there's an existing record
  SELECT id INTO existing_id
  FROM public.user_feature_targeting
  WHERE user_id = user_uuid AND feature_id = feature_uuid;

  IF existing_id IS NOT NULL THEN
    -- Update existing
    UPDATE public.user_feature_targeting
    SET is_enabled = enabled, updated_at = now()
    WHERE id = existing_id;
  ELSE
    -- Insert new
    INSERT INTO public.user_feature_targeting (user_id, feature_id, is_enabled)
    VALUES (user_uuid, feature_uuid, enabled);
  END IF;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create RPC function for removing user feature targeting
CREATE OR REPLACE FUNCTION public.remove_user_feature_targeting(target_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user requesting has admin privileges
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;

  -- Delete the record
  DELETE FROM public.user_feature_targeting
  WHERE id = target_uuid;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
