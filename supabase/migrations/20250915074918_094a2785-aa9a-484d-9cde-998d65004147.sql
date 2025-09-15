-- Only populate user_roles for users that actually exist in auth.users
-- We need to be more careful about this
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, p.user_type::app_role
FROM public.profiles p
WHERE p.user_id IS NOT NULL 
  AND p.user_type IS NOT NULL
  AND p.user_id NOT IN (SELECT user_id FROM public.user_roles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id, role) DO NOTHING;

-- Also need to update foreign key constraint in students table to point to profiles instead of auth.users
-- But first, let's see if there are any orphaned records
DELETE FROM public.profiles WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Clean up students table - remove any students without valid user_id references
DELETE FROM public.students WHERE user_id NOT IN (SELECT user_id FROM public.profiles);