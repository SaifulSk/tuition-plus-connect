-- Drop the public access policy for fees table
DROP POLICY IF EXISTS "All can view fees" ON public.fees;

-- Drop any duplicate policies
DROP POLICY IF EXISTS "Teachers can manage fees" ON public.fees;

-- Create proper role-based access policies for fees table

-- Policy 1: Teachers can view all fees
CREATE POLICY "Teachers can view all fees"
ON public.fees
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Policy 2: Students can view their own fees
CREATE POLICY "Students can view own fees"
ON public.fees
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT id 
    FROM public.students 
    WHERE user_id = auth.uid()
  )
);

-- Policy 3: Parents can view their children's fees
CREATE POLICY "Parents can view children fees"
ON public.fees
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT s.id
    FROM public.students s
    WHERE s.parent_id = (
      SELECT id 
      FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy 4: Teachers can insert fees
CREATE POLICY "Teachers can insert fees"
ON public.fees
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'teacher'));

-- Policy 5: Teachers can update fees
CREATE POLICY "Teachers can update fees"
ON public.fees
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Policy 6: Teachers can delete fees
CREATE POLICY "Teachers can delete fees"
ON public.fees
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));