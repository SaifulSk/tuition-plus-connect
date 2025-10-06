-- First, let's try to populate roles for existing valid users only
-- We'll use a more conservative approach

-- Check which user_ids exist in both profiles and auth.users (via a simple insert)
DO $$
DECLARE
    profile_record RECORD;
BEGIN
    FOR profile_record IN 
        SELECT user_id, user_type 
        FROM public.profiles 
        WHERE user_type IS NOT NULL
    LOOP
        BEGIN
            -- Try to insert, if it fails due to FK constraint, skip it
            INSERT INTO public.user_roles (user_id, role)
            VALUES (profile_record.user_id, profile_record.user_type::app_role)
            ON CONFLICT (user_id, role) DO NOTHING;
        EXCEPTION
            WHEN foreign_key_violation THEN
                -- Skip this record if the user doesn't exist in auth.users
                CONTINUE;
        END;
    END LOOP;
END $$;