"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, adminRegisterSchema } from "@/lib/schema/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: "Invalid email or password." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check role and redirect
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/shop");
  }
}

export async function registerAction(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const parsed = registerSchema.safeParse({ fullName, phone, email, password, confirmPassword });
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createClient();
  
  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    }
  });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    // Use admin client to ensure we can insert the profile securely without relying on session state
    const adminSupabase = createAdminClient();
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        full_name: fullName,
        phone: phone,
        role: "customer"
      });

    if (profileError) {
      // Log error internally, but registration basically succeeded
      console.error("Profile creation failed:", profileError);
    }
  }

  redirect("/shop");
}

export async function registerAdminAction(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const secretCode = formData.get("secretCode") as string;

  const parsed = adminRegisterSchema.safeParse({ fullName, phone, email, password, confirmPassword, secretCode });
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  // Validate the secret code against environment variable
  const validSecret = process.env.ADMIN_REGISTRATION_SECRET;
  if (!validSecret || secretCode !== validSecret) {
    return { error: "Invalid admin registration secret." };
  }

  const supabase = createClient();
  
  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    }
  });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    // Use admin client to insert profile with "admin" role
    const adminSupabase = createAdminClient();
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        full_name: fullName,
        phone: phone,
        role: "admin"
      });

    if (profileError) {
      console.error("Admin Profile creation failed:", profileError);
    }
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { error: "Invalid email address." };
  }

  const supabase = createClient();
  // Ensure NEXT_PUBLIC_SITE_URL is set or fallback to localhost
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password reset link sent to your email." };
}

export async function resetPasswordAction(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  
  const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?reset=success");
}
