import { SupabaseClient } from "@supabase/auth-helpers-nextjs";

export async function getUserOrganizations(
  supabase: SupabaseClient,
  userId: string
) {
  // Fetch the user's profile to get organization_id and connected_organizations
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id, connected_organizations")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return {
      data: null,
      error: profileError || new Error("Profile not found"),
    };
  }

  // Collect all unique organization IDs
  const orgIds = [
    profile.organization_id,
    ...(profile.connected_organizations || []),
  ].filter(Boolean);
  if (orgIds.length === 0) {
    return { data: [], error: null };
  }

  // Fetch all organizations by IDs
  const { data: organizations, error: orgsError } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .in("id", orgIds);

  return { data: organizations, error: orgsError };
}
