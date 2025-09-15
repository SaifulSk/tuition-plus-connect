-- First, create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('teacher', 'student', 'parent');

-- Create a user_roles table to manage roles separately
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create a function to get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Drop the existing "Users can view all profiles" policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new restrictive policies for profiles table
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view student profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher') AND
  user_id IN (
    SELECT s.user_id
    FROM public.students s
    WHERE s.user_id = profiles.user_id
  )
);

CREATE POLICY "Teachers can view parent profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher') AND
  id IN (
    SELECT s.parent_id
    FROM public.students s
    WHERE s.parent_id = profiles.id
  )
);

CREATE POLICY "Parents can view their children's profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'parent') AND
  id IN (
    SELECT p.id
    FROM public.profiles p
    INNER JOIN public.students s ON s.user_id = p.user_id
    WHERE s.parent_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Students can view their teacher profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student') AND
  public.has_role(profiles.user_id, 'teacher')
);

CREATE POLICY "Students can view their parent profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student') AND
  id = (
    SELECT s.parent_id
    FROM public.students s
    WHERE s.user_id = auth.uid()
  )
);

-- Create policies for user_roles table
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Update the handle_new_user function to create roles based on user_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role app_role;
BEGIN
  -- Determine role from user_type
  user_role := COALESCE(NEW.raw_user_meta_data->>'user_type', 'student')::app_role;
  
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, username, name, email, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student')
  );
  
  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;

-- Create a trigger to update user_roles when user_type changes in profiles
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

CREATE TRIGGER sync_user_role_trigger
AFTER UPDATE OF user_type ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role();