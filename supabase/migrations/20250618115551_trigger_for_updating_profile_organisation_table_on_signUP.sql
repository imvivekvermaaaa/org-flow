-- Drop the trigger first (since it depends on the function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
 
-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    org_id UUID;
    user_role TEXT;
    org_name TEXT;
BEGIN
    -- Check if organization_id and role are provided in metadata
    org_id := COALESCE(NEW.raw_user_meta_data->>'organization_id', NULL);
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', NULL);

    IF org_id IS NOT NULL AND user_role IS NOT NULL THEN
        -- Invited member: use provided org and role
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            organization_id,
            role
        )
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            org_id,
            user_role
        );
    ELSE
        -- Default: create new org and owner profile
        org_name := COALESCE(NEW.raw_user_meta_data->>'organization_name', 'My Organization');
        INSERT INTO public.organizations (name, slug)
        VALUES (
            org_name,
            'org-' || NEW.id::text
        )
        RETURNING id INTO new_org_id;

        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            organization_id,
            role
        )
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            new_org_id,
            'owner'
        );
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log any errors that occur
        RAISE NOTICE 'Error in handle_new_user_signup: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger with explicit schema references
DO $$ 
BEGIN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Create new trigger
    EXECUTE 'CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user_signup()';
        
    RAISE NOTICE 'Trigger created successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating trigger: %', SQLERRM;
END $$;
