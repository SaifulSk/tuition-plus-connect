-- Drop the existing "Users can view all profiles" policy that's causing the security issue
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new restrictive policies for profiles table
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view student and parent profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher') AND
  (
    -- Can view student profiles
    user_id IN (
      SELECT s.user_id
      FROM public.students s
    )
    OR
    -- Can view parent profiles
    id IN (
      SELECT s.parent_id
      FROM public.students s
      WHERE s.parent_id IS NOT NULL
    )
  )
);

CREATE POLICY "Parents can view their children and teacher profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'parent') AND
  (
    -- Can view their children's profiles
    id IN (
      SELECT p.id
      FROM public.profiles p
      INNER JOIN public.students s ON s.user_id = p.user_id
      WHERE s.parent_id = (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
    OR
    -- Can view teacher profiles
    public.has_role(profiles.user_id, 'teacher')
  )
);

CREATE POLICY "Students can view teacher and parent profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student') AND
  (
    -- Can view teacher profiles
    public.has_role(profiles.user_id, 'teacher')
    OR
    -- Can view their parent profile
    id = (
      SELECT s.parent_id
      FROM public.students s
      WHERE s.user_id = auth.uid()
    )
  )
);