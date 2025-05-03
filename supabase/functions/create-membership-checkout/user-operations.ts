
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

/**
 * Functions for handling user operations
 */
export const userOperations = {
  /**
   * Get user by email or auth token
   */
  getUserByEmailOrToken: async (email: string, authToken: string | null = null) => {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let userId = null;
    
    // Try to get user from auth token
    if (authToken) {
      try {
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(authToken);
        if (!userError && userData?.user) {
          userId = userData.user.id;
        }
      } catch {}
    }

    // If no user found by token, try to get user by email
    if (!userId) {
      const { data: userList } = await supabaseClient.auth.admin.listUsers();
      const user = userList.users.find((u) => u.email === email);
      userId = user?.id || userId;
    }
    
    return userId;
  }
};
