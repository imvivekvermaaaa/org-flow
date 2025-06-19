import { SupabaseClient } from "@supabase/auth-helpers-nextjs";

interface AddMemberParams {
  id: string;
  email: string;
  full_name: string;
  organization_id: string;
  role?: string;
}

export async function addOrganizationMember(
  supabase: SupabaseClient,
  params: AddMemberParams
) {
  return await supabase.from("profiles").insert({
    id: params.id,
    email: params.email,
    full_name: params.full_name,
    organization_id: params.organization_id,
    role: params.role || "member",
  });
}

// Add this function for organization_invites
interface AddInviteParams {
  organization_id: string;
  email: string;
  status?: string;
}

export async function addOrganizationInvite(
  supabase: SupabaseClient,
  params: AddInviteParams
) {
  return await supabase.from("organization_invites").insert({
    organization_id: params.organization_id,
    email: params.email,
    status: params.status || "pending",
  });
}
