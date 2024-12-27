'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../utils/supabase/server';

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const referral = formData.get('referral') as string | null;

  if (!email || !password) {
    console.error("Email or password is missing");
    return redirect(`/error?msg=${'Missing_email_or_password'}&code=${400}`);
  }

    const { data: existingUser, error: userCheckError } = await supabase
      .from('user')
      .select('id')
      .eq('email', email)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      return redirect(`/error?msg=${userCheckError.code}&code=${userCheckError.code}`);
    }

    if (existingUser) {
      return redirect(`/error?msg=${'User_already_exists'}&code=${409}`);
    }

    const { data: user, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_CLIENT_URL}/login`,
        data: {
          referral_code: Math.random().toString(36).substr(2, 8),
        },
      },
    });

    if (error) {
      console.error('Error during sign-up:', error.message);
      return redirect(`/error?msg=${error.message}&code=${error.status}`);
    }

    if (referral && user?.user?.id) {
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referred_by: referral,
          user_id: user.user.id,
        });
  
      if (referralError) {
        console.error('Error adding referral:', referralError);
        return redirect(`/error?msg=${'referral_creation_failed'}&code=${500}`);
      }
    }

    revalidatePath('/', 'layout');
    return redirect('/');
}
