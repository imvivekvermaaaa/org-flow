import { SupabaseClient } from "@supabase/auth-helpers-nextjs";

export async function getOrganizationMembers(
  supabase: SupabaseClient,
  organizationId: string
) {
  return await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("organization_id", organizationId);
}
