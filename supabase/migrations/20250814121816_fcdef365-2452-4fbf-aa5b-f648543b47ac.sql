-- Remove foreign key constraint from profiles table if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Insert mock users into profiles table (using generated UUIDs)
INSERT INTO public.profiles (user_id, username, name, email, phone, user_type) VALUES
(gen_random_uuid(), 'teacher1', 'Dr. Rajesh Kumar', 'rajesh@tuitionplus.com', '+91 9876543210', 'teacher'),
(gen_random_uuid(), 'student1', 'Priya Sharma', 'priya@email.com', '+91 9876543211', 'student'),
(gen_random_uuid(), 'student2', 'Arjun Singh', 'arjun@email.com', '+91 9876543212', 'student'),
(gen_random_uuid(), 'parent1', 'Suresh Sharma', 'suresh@email.com', '+91 9876543213', 'parent'),
(gen_random_uuid(), 'parent2', 'Meera Singh', 'meera@email.com', '+91 9876543214', 'parent');

-- Get the IDs for reference
WITH profile_ids AS (
  SELECT id, user_type, name FROM profiles 
  WHERE username IN ('teacher1', 'student1', 'student2', 'parent1', 'parent2')
),
teacher_id AS (SELECT id FROM profile_ids WHERE user_type = 'teacher' LIMIT 1),
student1_id AS (SELECT id FROM profile_ids WHERE name = 'Priya Sharma'),
student2_id AS (SELECT id FROM profile_ids WHERE name = 'Arjun Singh'), 
parent1_id AS (SELECT id FROM profile_ids WHERE name = 'Suresh Sharma'),
parent2_id AS (SELECT id FROM profile_ids WHERE name = 'Meera Singh')

-- Insert students with proper parent references
INSERT INTO public.students (user_id, name, email, phone, class, subjects, parent_id) 
SELECT 
  s1.id,
  'Priya Sharma',
  'priya@email.com', 
  '+91 9876543211',
  '10th',
  ARRAY['Mathematics', 'Physics', 'Chemistry'],
  p1.id
FROM student1_id s1, parent1_id p1
UNION ALL
SELECT 
  s2.id,
  'Arjun Singh',
  'arjun@email.com',
  '+91 9876543212', 
  '12th',
  ARRAY['Mathematics', 'Physics'],
  p2.id
FROM student2_id s2, parent2_id p2;