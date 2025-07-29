"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSideClient } from "../utils/supabase/server";
import { ActionResponse } from "@/components/type-identifiers";

export const login = async (
  prevState: any,
  formData: FormData
): Promise<ActionResponse<void>> => {
  const supabase = await createServerSideClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    console.error("Email or password is missing");
    return { success: false, errors: "Email or password is missing" };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !user) {
    return { success: false, errors: error?.message ?? "Error logging in" };
  }

  const { data: profile, error: profErr } = await supabase
    .from("user")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profErr || !profile?.role) {
    return { success: false, errors: "User role not found" };
  }

  const role = profile.role;
  if (role === "admin") {
    redirect("/admin");
  } else {
    revalidatePath("/");
    redirect("/");
  }

  // fallback just in case
  return { success: true, message: "Login successful" };
};
