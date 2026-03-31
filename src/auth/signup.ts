import { supabase } from "@/lib/supabaseClient";

export type SignUpResult = {
  success: boolean;
  error: string | null;
  message?: string;
};

export async function signUp(email: string, password: string, username: string): Promise<SignUpResult> {
  if (!email || !password || !username) {
    return { success: false, error: "All fields are required." };
  }

  const normalizedUsername = username.trim().toLowerCase();
  if (normalizedUsername.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." };
  }

  console.log("Checking username:", normalizedUsername);
  const { data: existingUser, error: usernameCheckError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", normalizedUsername)
    .maybeSingle();
  console.log("Username check result:", existingUser);
  console.log("Username check error:", usernameCheckError);
  if (usernameCheckError) {
    try {
      console.log("Username check error JSON:", JSON.stringify(usernameCheckError));
    } catch {
      // ignore stringify errors
    }
  }

  if (usernameCheckError) {
    console.error("Username check error:", {
      message: usernameCheckError.message,
      code: (usernameCheckError as { code?: string }).code,
      details: (usernameCheckError as { details?: string }).details,
      hint: (usernameCheckError as { hint?: string }).hint,
    });

    const message = usernameCheckError.message.toLowerCase();
    if (
      message.includes("permission") ||
      message.includes("denied") ||
      message.includes("rls") ||
      message.includes("forbidden")
    ) {
      return { success: false, error: "Username check blocked. Please verify RLS policy." };
    }

    if (message.includes("relation") || message.includes("column")) {
      return { success: false, error: "Username check failed. Verify table/column names." };
    }

    return { success: false, error: "Checking username failed. Please try again." };
  }

  if (existingUser) {
    return { success: false, error: "Username already in use." };
  }

  const { error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        username: normalizedUsername,
      },
    },
  });

  if (error) {
    console.error("Signup error:", error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    error: null,
    message: "Check your email and click the confirmation link.",
  };
}
