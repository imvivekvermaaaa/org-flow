import { SupabaseClient } from "@supabase/auth-helpers-nextjs";

export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  return await supabase
    .from("profiles")
    .select("*, organizations(*)")
    .eq("id", userId)
    .single();
}
