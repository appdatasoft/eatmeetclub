import { supabase } from "@/integrations/supabase/client";

/**
 * Validates email data to prevent undefined placeholders
 */
const validateEmailData = (email: string, name?: string): { valid: boolean, email: string, name: string } => {
  // Sanitize name and email
  const sanitizedName = (!name || name === "undefined") ? "Member" : name.trim();
  const isEmailValid = email && email !== "undefined" && email.includes('@');
  
  return {
    valid: isEmailValid,
    email: isEmailValid ? email : "",
    name: sanitizedName
  };
};

export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  // First validate the input data
  const { valid, email: validEmail, name: validName } = validateEmailData(email, name);
  
  if (!valid) {
    console.error("Invalid email data provided to sendWelcomeEmail:", { email, name });
    return false;
  }
  
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    console.error("No Supabase session found.");
    return false;
  }

  const res = await fetch("/functions/send-welcome-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email: validEmail, name: validName }),
  });

  return res.ok;
}
