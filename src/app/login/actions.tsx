"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "../utils/supabase/server";
import { ActionResponse } from "@/components/type-identifiers";

export const login = async (
  prevState: any,
  formData: FormData
): Promise<ActionResponse<void>> => {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Check if the email and password are present
  if (!email || !password) {
    console.error("Email or password is missing");
    return {
      success: false,
      errors: "Email or password is missing",
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      errors: error ? error.message : "Error logging in",
    };
  }

  if (user) {
    return { success: true, message: "Login Successfully" };
  }

  revalidatePath("/", "layout");
  redirect("/");
};
