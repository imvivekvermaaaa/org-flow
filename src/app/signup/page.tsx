import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';

interface SignUpPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const params = await searchParams;
  
  // Check if user is already authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    redirect('/');
  }

  // If there's an invite token, verify it
  let inviteData = null;
  const token = params?.token;
  if (token) {
    const { data, error } = await supabase
      .from('organization_invites')
      .select('organization_id, email, status')
      .eq('token', token)
      .single();

    if (!error && data && data.status === 'pending') {
      inviteData = data;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          {inviteData ? 'Join Organization' : 'Create Your Organization'}
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          {inviteData
            ? 'Complete your account setup to join the organization'
            : 'Get started with your new organization'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AuthForm type="signup" inviteToken={token} />
      </div>
    </div>
  );
} 