
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

/**
 * Functions for handling user creation and retrieval
 */
export const userOperations = {
  /**
   * Find or create a user by email
   * @returns User ID and whether the user was created
   */
  findOrCreateUser: async (
    email: string, 
    name: string | null = null, 
    phone: string | null = null, 
    address: string | null = null,
    options = {
      sendPasswordEmail: true,
      forceCreateUser: true
    }
  ) => {
    console.log("Looking for user with email:", email);
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const userResp = await supabase.auth.admin.listUsers();
    const user = userResp.data.users.find((u) => u.email === email);
    let userId = user?.id;
    let passwordEmailSent = false;

    // Create the user if they don't exist
    if (!userId && options.forceCreateUser !== false) {
      console.log("User not found, creating new user");
      const tempPassword = crypto.randomUUID();
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        password: tempPassword,
        user_metadata: { 
          full_name: name || email.split('@')[0],
          phone: phone,
          address: address
        }
      });
      
      if (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user: " + error.message);
      }
      
      userId = newUser.user?.id;
      console.log("New user created with ID:", userId);
      
      // Send password setup link if requested
      if (options.sendPasswordEmail !== false) {
        try {
          console.log("Sending password setup email");
          await supabase.auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo: "https://www.eatmeetclub.com/set-password" }
          });
          passwordEmailSent = true;
          console.log("Password email sent successfully");
        } catch (emailError) {
          console.error("Error sending password email:", emailError);
        }
      }
      
      return { userId, isNewUser: true, passwordEmailSent };
    } 
    
    console.log("User found:", userId);
    return { userId, isNewUser: false, passwordEmailSent: false };
  }
};
