-- Fix the search_path issues for the functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update or insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, NEW.user_type::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Remove old roles that don't match
  DELETE FROM public.user_roles
  WHERE user_id = NEW.user_id
    AND role != NEW.user_type::app_role;
    
  RETURN NEW;
END;
$$;

-- Populate user_roles table for existing users
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, user_type::app_role
FROM public.profiles
WHERE user_id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id, role) DO NOTHING;