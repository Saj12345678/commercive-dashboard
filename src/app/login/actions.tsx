'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Check if the email and password are present
  if (!email || !password) {
    console.error("Email or password is missing");
    return redirect('/error'); 
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/error?msg=${error.code}&code=${error.status}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}