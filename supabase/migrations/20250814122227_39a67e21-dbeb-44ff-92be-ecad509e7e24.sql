-- Insert students with correct parent_id references
INSERT INTO public.students (id, user_id, name, email, phone, class, subjects, parent_id) VALUES
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'Priya Sharma', 'priya@email.com', '+91 9876543211', '10th', ARRAY['Mathematics', 'Physics', 'Chemistry'], 'fcbd7062-310f-43d2-8ba8-8fcea34edec6'),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d78', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d78', 'Arjun Singh', 'arjun@email.com', '+91 9876543212', '12th', ARRAY['Mathematics', 'Physics'], '05f44d6c-8991-400a-8d4b-fafd97abb856');

-- Insert fees
INSERT INTO public.fees (student_id, month, amount_due, amount_paid, payment_date, status, payment_method) VALUES
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'January 2024', 3000, 3000, '2024-01-05', 'paid', 'Cash'),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'February 2024', 3000, 0, NULL, 'pending', NULL),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d78', 'January 2024', 2500, 2500, '2024-01-03', 'paid', 'Online'),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d78', 'February 2024', 2500, 2500, '2024-02-01', 'paid', 'Online');

-- Insert homework with UUID format
INSERT INTO public.homework (id, title, subject, description, assigned_date, due_date, assigned_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Chapter 5: Quadratic Equations', 'Mathematics', 'Solve exercises 5.1 to 5.3 from textbook', '2024-02-01', '2024-02-05', '172f93c7-016e-454b-b2b8-086abf50f813'),
('550e8400-e29b-41d4-a716-446655440002', 'Light and Reflection', 'Physics', 'Complete numerical problems from chapter 10', '2024-02-02', '2024-02-06', '172f93c7-016e-454b-b2b8-086abf50f813'),
('550e8400-e29b-41d4-a716-446655440003', 'Integration Practice', 'Mathematics', 'Solve integration problems from chapter 7', '2024-02-01', '2024-02-04', '172f93c7-016e-454b-b2b8-086abf50f813');

-- Insert homework submissions with UUID homework IDs
INSERT INTO public.homework_submissions (homework_id, student_id, status, submitted_date, parent_acknowledged) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'pending', NULL, false),
('550e8400-e29b-41d4-a716-446655440002', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 'completed', '2024-02-05 10:30:00', true),
('550e8400-e29b-41d4-a716-446655440003', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d78', 'completed', '2024-02-03 15:45:00', true);

-- Insert tests with UUID format
INSERT INTO public.tests (id, title, subject, test_date, max_marks, created_by) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Mathematics Unit Test - Algebra', 'Mathematics', '2024-02-10', 100, '172f93c7-016e-454b-b2b8-086abf50f813'),
('650e8400-e29b-41d4-a716-446655440002', 'Physics Test - Optics', 'Physics', '2024-02-12', 75, '172f93c7-016e-454b-b2b8-086abf50f813');

-- Insert test results with UUID test IDs
INSERT INTO public.test_results (test_id, student_id, marks_obtained) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c67', 85);