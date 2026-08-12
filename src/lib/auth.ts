import { createClient } from "@/lib/supabase/server";

export type UserRole = "customer" | "admin";

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
}

export async function getUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error || !data) {
    return null;
  }
  
  return data as UserProfile;
}

export async function requireAdmin() {
  const user = await getUser();
  if (!user) return false;
  
  const profile = await getProfile(user.id);
  return profile?.role === 'admin';
}
