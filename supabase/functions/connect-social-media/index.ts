import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

interface SocialMediaRequest {
  platform: string;
  action?: string;
  code?: string;
  redirectUri?: string;
  state?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get the JWT token to verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { headers: corsHeaders, status: 401 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    console.log(`[connect-social-media] Initializing Supabase client with URL: ${supabaseUrl.substring(0, 30)}...`);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the JWT token and get the user's ID
    const token = authHeader.replace("Bearer ", "");
    console.log(`[connect-social-media] Verifying token: ${token.substring(0, 15)}...`);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("[connect-social-media] Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token", details: authError }),
        { headers: corsHeaders, status: 401 }
      );
    }
    
    console.log(`[connect-social-media] Authenticated user: ${user.id}`);

    // Get the request parameters
    let requestData: SocialMediaRequest;
    try {
      requestData = await req.json();
      console.log(`[connect-social-media] Request data:`, {
        platform: requestData.platform,
        action: requestData.action,
        hasCode: !!requestData.code,
        redirectUri: requestData.redirectUri,
        state: requestData.state
      });
    } catch (e) {
      console.error("[connect-social-media] Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    const { platform, action = "connect", code, redirectUri, state } = requestData;

    console.log(`[connect-social-media] Processing ${action} request for ${platform} by user ${user.id}`);
    console.log(`[connect-social-media] Received redirectUri: ${redirectUri}`);

    // Check if the platform is supported
    const supportedPlatforms = ["Instagram", "Facebook", "Twitter", "X/Twitter", "TikTok", "YouTube", "Google Business", "Google Maps", "Yelp"];
    if (!supportedPlatforms.includes(platform)) {
      return new Response(
        JSON.stringify({ error: "Unsupported platform" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Handle disconnect action
    if (action === "disconnect") {
      console.log(`[connect-social-media] Disconnecting ${platform} for user ${user.id}`);
      
      // First, find the connection to disconnect
      const { data: connection, error: fetchError } = await supabase
        .from('social_media_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .single();
      
      if (fetchError) {
        console.error(`[connect-social-media] Error fetching connection:`, fetchError);
        return new Response(
          JSON.stringify({ error: `Failed to find ${platform} connection: ${fetchError.message}` }),
          { headers: corsHeaders, status: 404 }
        );
      }
      
      if (!connection) {
        return new Response(
          JSON.stringify({ error: `No connected ${platform} account found` }),
          { headers: corsHeaders, status: 404 }
        );
      }

      // Delete the connection from the database
      const { error: deleteError } = await supabase
        .from('social_media_connections')
        .delete()
        .eq('id', connection.id);

      if (deleteError) {
        console.error(`[connect-social-media] Error deleting connection:`, deleteError);
        return new Response(
          JSON.stringify({ error: `Failed to disconnect ${platform}: ${deleteError.message}` }),
          { headers: corsHeaders, status: 500 }
        );
      }
      
      console.log(`[connect-social-media] Successfully disconnected ${platform} for user ${user.id}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully disconnected ${platform} account` 
        }),
        { headers: corsHeaders, status: 200 }
      );
    }

    // Handle Facebook specific OAuth flow
    if (platform === "Facebook") {
      // Handle different OAuth actions
      if (action === "initiate") {
        // Facebook App credentials
        const clientId = Deno.env.get("FACEBOOK_APP_ID");
        
        // Use the provided redirectUri or default to the new path
        const redirectUrl = redirectUri || "https://eatmeetclub.com/auth/facebook/callback";

        if (!clientId) {
          return new Response(
            JSON.stringify({ error: "Facebook App ID not configured" }),
            { headers: corsHeaders, status: 500 }
          );
        }

        console.log(`[connect-social-media] Initiating Facebook OAuth flow with redirect: ${redirectUrl}`);

        // Generate authorization URL - using only public_profile scope which is available without app review
        const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
        authUrl.searchParams.append("client_id", clientId);
        authUrl.searchParams.append("redirect_uri", redirectUrl);
        authUrl.searchParams.append("scope", "public_profile,email"); // Removed scopes that require app review
        authUrl.searchParams.append("response_type", "code");
        authUrl.searchParams.append("state", state || `facebook_${Math.random().toString(36).substring(2, 15)}`);

        return new Response(
          JSON.stringify({ authUrl: authUrl.toString() }),
          { headers: corsHeaders, status: 200 }
        );
      } else if (action === "callback") {
        // Handle the OAuth callback
        if (!code) {
          return new Response(
            JSON.stringify({ error: "Missing authorization code" }),
            { headers: corsHeaders, status: 400 }
          );
        }

        const clientId = Deno.env.get("FACEBOOK_APP_ID");
        const clientSecret = Deno.env.get("FACEBOOK_APP_SECRET");
        // Use the provided redirectUri or default
        const redirectUrl = redirectUri || "https://eatmeetclub.com/auth/facebook/callback";

        if (!clientId || !clientSecret) {
          return new Response(
            JSON.stringify({ error: "Facebook App ID or Secret not configured" }),
            { headers: corsHeaders, status: 500 }
          );
        }

        console.log(`[connect-social-media] Processing Facebook callback with code length: ${code.length} and redirect: ${redirectUrl}`);

        // Exchange code for access token
        try {
          // Construct the exchange URL with proper parameters
          const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
          tokenUrl.searchParams.append("client_id", clientId);
          tokenUrl.searchParams.append("client_secret", clientSecret);
          tokenUrl.searchParams.append("redirect_uri", redirectUrl);
          tokenUrl.searchParams.append("code", code);

          console.log(`[connect-social-media] Token request URL: ${tokenUrl.toString().replace(clientSecret, "REDACTED")}`);

          // Make the request using proper URL-encoded form
          const tokenResponse = await fetch(tokenUrl.toString(), {
            method: "GET",
            headers: {
              "Accept": "application/json"
            }
          });

          const responseText = await tokenResponse.text();
          console.log(`[connect-social-media] Raw token response: ${responseText.substring(0, 100)}...`);
          
          let tokenData;
          try {
            tokenData = JSON.parse(responseText);
          } catch (e) {
            console.error("[connect-social-media] Error parsing token response:", e);
            return new Response(
              JSON.stringify({ error: "Failed to parse token response", raw: responseText }),
              { headers: corsHeaders, status: 500 }
            );
          }
          
          if (!tokenResponse.ok || tokenData.error) {
            console.error("[connect-social-media] Facebook token exchange error:", tokenData);
            return new Response(
              JSON.stringify({ 
                error: tokenData.error_message || tokenData.error_description || "Failed to exchange code for token",
                details: tokenData
              }),
              { headers: corsHeaders, status: 400 }
            );
          }

          // Get user profile information 
          const accessToken = tokenData.access_token;
          
          // Get user profile data
          const userResponse = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
          );

          const userData = await userResponse.json();

          if (!userResponse.ok || userData.error) {
            console.error("[connect-social-media] Facebook user data error:", userData);
            return new Response(
              JSON.stringify({ 
                error: userData.error?.message || "Failed to get user profile" 
              }),
              { headers: corsHeaders, status: 400 }
            );
          }
          
          console.log(`[connect-social-media] Facebook user data retrieved:`, {
            id: userData.id,
            name: userData.name,
            has_email: !!userData.email
          });

          // Save the connection to the database
          try {
            console.log(`[connect-social-media] Saving Facebook connection for user ${user.id}`);
            
            // First check if connection already exists
            const { data: existingConn } = await supabase
              .from('social_media_connections')
              .select('id')
              .eq('user_id', user.id)
              .eq('platform', 'Facebook')
              .maybeSingle();
            
            console.log(`[connect-social-media] Existing connection check:`, existingConn);
            
            let connection;
            
            if (existingConn) {
              // Update existing connection
              const { data: updatedConn, error: updateError } = await supabase
                .from('social_media_connections')
                .update({
                  username: userData.name,
                  profile_url: `https://facebook.com/${userData.id}`,
                  is_connected: true,
                  oauth_token: accessToken,
                  oauth_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
                  meta_data: { 
                    facebook_user_id: userData.id,
                    connected_at: new Date().toISOString()
                  },
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingConn.id)
                .select()
                .single();
              
              if (updateError) throw updateError;
              connection = updatedConn;
              console.log(`[connect-social-media] Updated existing Facebook connection, id: ${connection.id}`);
            } else {
              // Create new connection
              const { data: newConn, error: insertError } = await supabase
                .from('social_media_connections')
                .insert({
                  user_id: user.id,
                  platform: "Facebook",
                  username: userData.name,
                  profile_url: `https://facebook.com/${userData.id}`,
                  is_connected: true,
                  oauth_token: accessToken,
                  oauth_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
                  meta_data: { 
                    facebook_user_id: userData.id,
                    connected_at: new Date().toISOString()
                  }
                })
                .select()
                .single();
              
              if (insertError) throw insertError;
              connection = newConn;
              console.log(`[connect-social-media] Created new Facebook connection, id: ${connection.id}`);
            }

            return new Response(
              JSON.stringify({ 
                success: true,
                connection, 
                message: `Successfully connected Facebook account for ${userData.name}` 
              }),
              { headers: corsHeaders, status: 200 }
            );
          } catch (error) {
            console.error("[connect-social-media] Database error saving connection:", error);
            return new Response(
              JSON.stringify({ error: `Failed to save connection: ${error.message}` }),
              { headers: corsHeaders, status: 500 }
            );
          }
        } catch (error) {
          console.error("[connect-social-media] Facebook OAuth error:", error);
          return new Response(
            JSON.stringify({ 
              error: error.message || "Failed to connect Facebook account",
              stack: error.stack
            }),
            { headers: corsHeaders, status: 500 }
          );
        }
      }
    }

    // Handle Instagram specific OAuth flow
    if (platform === "Instagram") {
      if (action === "initiate") {
        // Instagram App credentials (same as Facebook App since it uses Facebook's OAuth)
        const clientId = Deno.env.get("FACEBOOK_APP_ID");
        
        // Use the provided redirectUri or default to the new path
        const redirectUrl = redirectUri || "https://eatmeetclub.com/auth/facebook/callback";

        if (!clientId) {
          return new Response(
            JSON.stringify({ error: "Facebook App ID not configured" }),
            { headers: corsHeaders, status: 500 }
          );
        }

        console.log(`[connect-social-media] Initiating Instagram OAuth flow with client ID: ${clientId.substring(0, 6)}... and redirect: ${redirectUrl}`);

        // Generate authorization URL using Facebook OAuth dialog with basic permissions only
        const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
        authUrl.searchParams.append("client_id", clientId);
        authUrl.searchParams.append("redirect_uri", redirectUrl);
        authUrl.searchParams.append("scope", "public_profile,email"); // Using only public_profile which is available in dev mode
        authUrl.searchParams.append("response_type", "code");
        if (state) {
          authUrl.searchParams.append("state", state);
        }
        
        // Print the full URL for debugging
        console.log("[connect-social-media] Generated Instagram auth URL (via Facebook):", authUrl.toString());

        return new Response(
          JSON.stringify({ 
            authUrl: authUrl.toString(),
            debug: {
              clientId: clientId.substring(0, 6) + "...",
              redirectUrl: redirectUrl,
              scope: "public_profile,email" // Updated scopes
            }
          }),
          { headers: corsHeaders, status: 200 }
        );
      } else if (action === "callback") {
        // Handle the OAuth callback
        if (!code) {
          return new Response(
            JSON.stringify({ error: "Missing authorization code" }),
            { headers: corsHeaders, status: 400 }
          );
        }

        const clientId = Deno.env.get("FACEBOOK_APP_ID");
        const clientSecret = Deno.env.get("FACEBOOK_APP_SECRET");
        // Use the site's own callback URL
        const redirectUrl = redirectUri || "https://eatmeetclub.com/auth/facebook/callback";

        if (!clientId || !clientSecret) {
          return new Response(
            JSON.stringify({ error: "Facebook App ID or Secret not configured" }),
            { headers: corsHeaders, status: 500 }
          );
        }

        console.log(`[connect-social-media] Processing Instagram callback with code: ${code.substring(0, 6)}... and redirect: ${redirectUrl}`);

        // Exchange code for access token using Facebook's token endpoint
        try {
          console.log("[connect-social-media] Attempting to exchange code for token via Facebook...");
          
          // Construct the token URL with proper query parameters
          const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
          tokenUrl.searchParams.append("client_id", clientId);
          tokenUrl.searchParams.append("client_secret", clientSecret);
          tokenUrl.searchParams.append("redirect_uri", redirectUrl);
          tokenUrl.searchParams.append("code", code);
          
          console.log("[connect-social-media] Token request URL:", tokenUrl.toString().replace(clientSecret, "REDACTED"));
          
          const tokenResponse = await fetch(tokenUrl.toString(), {
            method: "GET",
            headers: {
              "Accept": "application/json"
            }
          });

          const responseText = await tokenResponse.text();
          console.log("[connect-social-media] Raw token response:", responseText);
          
          let tokenData;
          try {
            tokenData = JSON.parse(responseText);
          } catch (e) {
            console.error("[connect-social-media] Error parsing token response:", e);
            return new Response(
              JSON.stringify({ error: "Failed to parse token response", raw: responseText }),
              { headers: corsHeaders, status: 500 }
            );
          }
          
          if (!tokenResponse.ok || tokenData.error) {
            console.error("[connect-social-media] Facebook/Instagram token exchange error:", tokenData);
            return new Response(
              JSON.stringify({ 
                error: tokenData.error_message || tokenData.error_description || "Failed to exchange code for token",
                details: tokenData
              }),
              { headers: corsHeaders, status: 400 }
            );
          }

          // Get user profile information 
          const accessToken = tokenData.access_token;
          
          // Get Facebook user's basic profile info only since we don't have Instagram permissions
          const userProfileResponse = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
          );
          
          const userData = await userProfileResponse.json();
          
          if (!userProfileResponse.ok || userData.error) {
            console.error("[connect-social-media] Error getting user profile:", userData);
            return new Response(
              JSON.stringify({ 
                error: "Failed to get user profile information",
                details: userData.error || "Unknown error"
              }),
              { headers: corsHeaders, status: 400 }
            );
          }
          
          console.log(`[connect-social-media] User profile data retrieved:`, {
            id: userData.id,
            name: userData.name,
            has_email: !!userData.email
          });
          
          // Store the Instagram connection
          try {
            console.log(`[connect-social-media] Saving Instagram connection for user ${user.id}`);
            
            // First check if connection already exists
            const { data: existingConn } = await supabase
              .from('social_media_connections')
              .select('id')
              .eq('user_id', user.id)
              .eq('platform', 'Instagram')
              .maybeSingle();
            
            console.log(`[connect-social-media] Existing Instagram connection check:`, existingConn);
            
            let connection;
            
            if (existingConn) {
              // Update existing connection
              const { data: updatedConn, error: updateError } = await supabase
                .from('social_media_connections')
                .update({
                  username: userData.name || "User",
                  is_connected: true,
                  oauth_token: accessToken,
                  oauth_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
                  meta_data: { 
                    facebook_user_id: userData.id,
                    connected_at: new Date().toISOString(),
                    limited_access: true,
                    note: "Limited access due to app development mode. Full Instagram integration requires app review."
                  },
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingConn.id)
                .select()
                .single();
              
              if (updateError) throw updateError;
              connection = updatedConn;
              console.log(`[connect-social-media] Updated existing Instagram connection, id: ${connection.id}`);
            } else {
              // Create new connection
              const { data: newConn, error: insertError } = await supabase
                .from('social_media_connections')
                .insert({
                  user_id: user.id,
                  platform: "Instagram",
                  username: userData.name || "User",
                  profile_url: null, // We don't have Instagram profile URL without permissions
                  is_connected: true,
                  oauth_token: accessToken,
                  oauth_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
                  meta_data: { 
                    facebook_user_id: userData.id,
                    connected_at: new Date().toISOString(),
                    limited_access: true,
                    note: "Limited access due to app development mode. Full Instagram integration requires app review."
                  }
                })
                .select()
                .single();
              
              if (insertError) {
                console.error("[connect-social-media] Error inserting Instagram connection:", insertError);
                throw insertError;
              }
              connection = newConn;
              console.log(`[connect-social-media] Created new Instagram connection, id: ${connection.id}`);
            }

            return new Response(
              JSON.stringify({ 
                success: true,
                connection, 
                message: `Connected with limited access. Full Instagram integration requires app review.`,
                limited_access: true
              }),
              { headers: corsHeaders, status: 200 }
            );
          } catch (error) {
            console.error("[connect-social-media] Database error saving Instagram connection:", error);
            return new Response(
              JSON.stringify({ error: `Failed to save connection: ${error.message}` }),
              { headers: corsHeaders, status: 500 }
            );
          }
        } catch (error) {
          console.error("[connect-social-media] Instagram OAuth error:", error);
          return new Response(
            JSON.stringify({ 
              error: error.message || "Failed to connect Instagram account",
              stack: error.stack || "No stack trace available"
            }),
            { headers: corsHeaders, status: 500 }
          );
        }
      }
    }

    // For other platforms - implement a mock connection
    try {
      console.log(`[connect-social-media] Creating mock connection for ${platform}`);
      
      // First check if connection already exists
      const { data: existingConn } = await supabase
        .from('social_media_connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .maybeSingle();
      
      let connection;
      
      const mockData = {
        username: "user_" + Math.random().toString(36).substring(2, 8),
        profile_url: `https://example.com/${platform}`,
        is_connected: true,
        meta_data: { connected_at: new Date().toISOString() }
      };
      
      if (existingConn) {
        // Update existing connection
        const { data: updatedConn, error: updateError } = await supabase
          .from('social_media_connections')
          .update({
            ...mockData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConn.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        connection = updatedConn;
        console.log(`[connect-social-media] Updated existing ${platform} connection, id: ${connection.id}`);
      } else {
        // Create new connection
        const { data: newConn, error: insertError } = await supabase
          .from('social_media_connections')
          .insert({
            user_id: user.id,
            platform,
            ...mockData
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        connection = newConn;
        console.log(`[connect-social-media] Created new ${platform} connection, id: ${connection.id}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          connection,
          message: `Successfully connected ${platform} account` 
        }),
        { headers: corsHeaders, status: 200 }
      );
    } catch (error) {
      console.error(`[connect-social-media] Error saving ${platform} connection:`, error);
      return new Response(
        JSON.stringify({ error: `Failed to save ${platform} connection: ${error.message}` }),
        { headers: corsHeaders, status: 500 }
      );
    }
  } catch (error) {
    console.error("[connect-social-media] Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        stack: error.stack || "No stack trace available"
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
