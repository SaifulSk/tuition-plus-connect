-- Drop all existing policies on students table
DROP POLICY IF EXISTS "All can view students" ON public.students;
DROP POLICY IF EXISTS "Students can view own data" ON public.students;
DROP POLICY IF EXISTS "Students can view own record" ON public.students;
DROP POLICY IF EXISTS "Parents can view their children" ON public.students;
DROP POLICY IF EXISTS "Teachers can manage students" ON public.students;
DROP POLICY IF EXISTS "Teachers can view all students" ON public.students;
DROP POLICY IF EXISTS "Teachers can insert students" ON public.students;
DROP POLICY IF EXISTS "Teachers can update students" ON public.students;
DROP POLICY IF EXISTS "Teachers can delete students" ON public.students;

-- Create proper role-based access policies for students table

-- Policy 1: Teachers can view all students
CREATE POLICY "Teachers can view all students"
ON public.students
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Policy 2: Students can view their own record
CREATE POLICY "Students can view own record"
ON public.students
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 3: Parents can view their children's records
CREATE POLICY "Parents can view their children"
ON public.students
FOR SELECT
TO authenticated
USING (
  parent_id = (
    SELECT id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- Policy 4: Teachers can insert students
CREATE POLICY "Teachers can insert students"
ON public.students
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'teacher'));

-- Policy 5: Teachers can update students
CREATE POLICY "Teachers can update students"
ON public.students
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Policy 6: Teachers can delete students
CREATE POLICY "Teachers can delete students"
ON public.students
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));