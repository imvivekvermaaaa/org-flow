import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import InviteMember from '@/components/organization/InviteMember';
import LogoutButton from '@/components/auth/LogoutButton';
import Notification from '@/components/organization/Notification';
import { getUserProfile } from '@/db-integration/queries/getUserProfile';
import { getOrganizationMembers } from '@/db-integration/queries/getOrganizationMembers';
import InviteMemberModal from '@/components/organization/InviteMemberModal';
import { getUserOrganizations } from '@/db-integration/queries/getUserOrganizations';
import OrganizationSelector from '@/components/organization/OrganizationSelector';

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      redirect('/signin');
    }

    // Get user's profile and organization
    const { data: profile, error: profileError } = await getUserProfile(supabase, session.user.id);

    if (profileError || !profile) {
      redirect('/signup');
    }

    // Fetch all organizations for the user
    const { data: organizations, error: orgsError } = await getUserOrganizations(supabase, session.user.id);

    if (orgsError) {
      console.error('Error fetching organizations:', orgsError);
    }

    // Get organization members
    const { data: members, error: membersError } = await getOrganizationMembers(supabase, profile.organization_id);

    if (membersError) {
      console.error('Error fetching members:', membersError);
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Organization Dropdown */}
          <OrganizationSelector organizations={organizations || []} initialOrganizationId={profile.organization_id} />
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.organizations.name}
                </h1>
                <div className="flex items-center gap-4">
                  <Notification />
                  {profile.role === 'owner' && (
                    <InviteMemberModal organizationId={profile.organization_id} />
                  )}
                  <LogoutButton />
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Team Members</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {members?.map((member) => (
                      <li key={member.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {member.full_name || member.email}
                            </p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    redirect('/signin');
  }
}
