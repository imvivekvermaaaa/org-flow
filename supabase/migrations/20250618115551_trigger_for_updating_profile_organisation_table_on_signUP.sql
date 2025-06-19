-- Drop the trigger first (since it depends on the function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
BEGIN
    -- Log the new user for debugging
    RAISE NOTICE 'New user signup: %', NEW.email;

    -- Create a new organization for the user
    INSERT INTO public.organizations (name, slug)
    VALUES (
        'My Organization',
        'org-' || NEW.id::text
    )
    RETURNING id INTO new_org_id;

    -- Log the created organization
    RAISE NOTICE 'Created organization with ID: %', new_org_id;

    -- Create profile for the new user
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

    -- Log the created profile
    RAISE NOTICE 'Created profile for user: %', NEW.id;

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
