-- Drop trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_add_org_to_connected_organizations ON organization_invites;
DROP FUNCTION IF EXISTS add_org_to_connected_organizations();

-- Function to add organization_id to connected_organizations when invite is accepted
CREATE OR REPLACE FUNCTION add_org_to_connected_organizations()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act when status changes to 'accepted'
    IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
        UPDATE profiles
        SET connected_organizations = 
            CASE 
                WHEN connected_organizations IS NULL THEN ARRAY[NEW.organization_id]
                WHEN NOT (NEW.organization_id = ANY(connected_organizations)) THEN connected_organizations || NEW.organization_id
                ELSE connected_organizations
            END
        WHERE email = NEW.email;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on organization_invites for status update
CREATE TRIGGER trigger_add_org_to_connected_organizations
AFTER UPDATE OF status ON organization_invites
FOR EACH ROW
EXECUTE FUNCTION add_org_to_connected_organizations();
