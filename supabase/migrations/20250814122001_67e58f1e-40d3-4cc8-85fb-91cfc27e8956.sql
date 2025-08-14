-- Drop all foreign key constraints that reference auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_user_id_fkey;

-- Clear existing data
DELETE FROM public.test_results;
DELETE FROM public.tests; 
DELETE FROM public.homework_submissions;
DELETE FROM public.homework;
DELETE FROM public.fees;
DELETE FROM public.students;
DELETE FROM public.profiles;

-- Insert mock data starting with profiles
INSERT INTO public.profiles (user_id, username, name, email, phone, user_type) VALUES
('d1e4f5b2-3c6a-4b7e-8f9a-1b2c3d4e5f67', 'teacher1', 'Dr. Rajesh Kumar', 'rajesh@tuitionplus.com', '+91 9876543210', 'teacher'),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'student1', 'Priya Sharma', 'priya@email.com', '+91 9876543211', 'student'),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d78', 'student2', 'Arjun Singh', 'arjun@email.com', '+91 9876543212', 'student'),
('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e89', 'parent1', 'Suresh Sharma', 'suresh@email.com', '+91 9876543213', 'parent'),
('d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f90', 'parent2', 'Meera Singh', 'meera@email.com', '+91 9876543214', 'parent');