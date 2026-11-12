import { supabase } from "./supabase.js"

export const updateUserPassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
};