import { supabase } from "@/lib/supabaseClient";

export type LoginResult = {
  success: boolean;
  session: object | null;
  error: string | null;
};

export async function login(emailOrUsername: string, password: string): Promise<LoginResult> {
  if (!emailOrUsername || !password) {
    return { success: false, session: null, error: "All fields are required." };
  }

  let emailToUse = emailOrUsername.trim().toLowerCase();
  const isUsername = !emailToUse.includes("@");

  if (isUsername) {
    const { data: profile, error: lookupError } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", emailToUse)
      .maybeSingle();

    if (lookupError) {
      console.error("Username lookup error:", lookupError);
      return { success: false, session: null, error: "Login failed. Please try again." };
    }

    if (!profile) {
      return { success: false, session: null, error: "Invalid credentials." };
    }

    emailToUse = profile.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailToUse,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    if (error.message.includes("Email not confirmed")) {
      return { success: false, session: null, error: "Please confirm your email before logging in." };
    }
    if (error.message.includes("Invalid login credentials")) {
      return { success: false, session: null, error: "Invalid credentials." };
    }
    return { success: false, session: null, error: error.message };
  }

  return { success: true, session: data.session, error: null };
}
