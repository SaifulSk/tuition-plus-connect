-- Insert students
INSERT INTO public.students (id, user_id, name, email, phone, class, subjects, parent_id) VALUES
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'Priya Sharma', 'priya@email.com', '+91 9876543211', '10th', ARRAY['Mathematics', 'Physics', 'Chemistry'], 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e89'),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d78', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d78', 'Arjun Singh', 'arjun@email.com', '+91 9876543212', '12th', ARRAY['Mathematics', 'Physics'], 'd4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f90');

-- Insert fees
INSERT INTO public.fees (student_id, month, amount_due, amount_paid, payment_date, status, payment_method) VALUES
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'January 2024', 3000, 3000, '2024-01-05', 'paid', 'Cash'),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'February 2024', 3000, 0, NULL, 'pending', NULL),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d78', 'January 2024', 2500, 2500, '2024-01-03', 'paid', 'Online'),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d78', 'February 2024', 2500, 2500, '2024-02-01', 'paid', 'Online');

-- Insert homework
INSERT INTO public.homework (id, title, subject, description, assigned_date, due_date, assigned_by) VALUES
('hw001', 'Chapter 5: Quadratic Equations', 'Mathematics', 'Solve exercises 5.1 to 5.3 from textbook', '2024-02-01', '2024-02-05', 'd1e4f5b2-3c6a-4b7e-8f9a-1b2c3d4e5f67'),
('hw002', 'Light and Reflection', 'Physics', 'Complete numerical problems from chapter 10', '2024-02-02', '2024-02-06', 'd1e4f5b2-3c6a-4b7e-8f9a-1b2c3d4e5f67'),
('hw003', 'Integration Practice', 'Mathematics', 'Solve integration problems from chapter 7', '2024-02-01', '2024-02-04', 'd1e4f5b2-3c6a-4b7e-8f9a-1b2c3d4e5f67');

-- Insert homework submissions
INSERT INTO public.homework_submissions (homework_id, student_id, status, submitted_date, parent_acknowledged) VALUES
('hw001', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'pending', NULL, false),
('hw002', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'completed', '2024-02-05 10:30:00', true),
('hw003', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d78', 'completed', '2024-02-03 15:45:00', true);

-- Insert tests
INSERT INTO public.tests (id, title, subject, test_date, max_marks, created_by) VALUES
('test001', 'Mathematics Unit Test - Algebra', 'Mathematics', '2024-02-10', 100, 'd1e4f5b2-3c6a-4b7e-8f9a-1b2c3d4e5f67'),
('test002', 'Physics Test - Optics', 'Physics', '2024-02-12', 75, 'd1e4f5b2-3c6a-4b7e-8f9a-1b2c3d4e5f67');

-- Insert test results
INSERT INTO public.test_results (test_id, student_id, marks_obtained) VALUES
('test001', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 85);