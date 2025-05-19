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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Verify the JWT token and get the user's ID
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { headers: corsHeaders, status: 401 }
      );
    }

    // Get the request parameters
    const requestData: SocialMediaRequest = await req.json();
    const { platform, action = "connect", code, redirectUri, state } = requestData;

    console.log(`Processing ${action} request for ${platform} by user ${user.id}`);

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
      console.log(`Disconnecting ${platform} for user ${user.id}`);
      
      // First, find the connection to disconnect
      const { data: connection, error: fetchError } = await supabase
        .from('social_media_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .single();
      
      if (fetchError) {
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

      // For OAuth connections, we may need to revoke access tokens
      // This would be platform-specific and could be implemented here

      // Delete the connection from the database
      const { error: deleteError } = await supabase
        .from('social_media_connections')
        .delete()
        .eq('id', connection.id);

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: `Failed to disconnect ${platform}: ${deleteError.message}` }),
          { headers: corsHeaders, status: 500 }
        );
      }

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
        // Always use the same consistent redirect URL
        const redirectUrl = redirectUri || "https://eatmeetclub.com/api/auth/callback/facebook";

        if (!clientId) {
          return new Response(
            JSON.stringify({ error: "Facebook App ID not configured" }),
            { headers: corsHeaders, status: 500 }
          );
        }

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
        // Always use the same consistent redirect URL
        const redirectUrl = redirectUri || "https://eatmeetclub.com/api/auth/callback/facebook";

        if (!clientId || !clientSecret) {
          return new Response(
            JSON.stringify({ error: "Facebook App ID or Secret not configured" }),
            { headers: corsHeaders, status: 500 }
          );
        }

        // Exchange code for access token
        try {
          const tokenResponse = await fetch("https://graph.facebook.com/v19.0/oauth/access_token", {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUrl,
              code: code
            })
          });

          const tokenData = await tokenResponse.json();
          
          if (!tokenResponse.ok || tokenData.error) {
            console.error("Facebook token exchange error:", tokenData);
            return new Response(
              JSON.stringify({ 
                error: tokenData.error_message || tokenData.error_description || "Failed to exchange code for token" 
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
            console.error("Facebook user data error:", userData);
            return new Response(
              JSON.stringify({ 
                error: userData.error?.message || "Failed to get user profile" 
              }),
              { headers: corsHeaders, status: 400 }
            );
          }

          // Save the connection to the database
          const { data: connection, error } = await supabase
            .from('social_media_connections')
            .upsert({
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
            }, { onConflict: 'user_id, platform' })
            .select()
            .single();

          if (error) {
            console.error("Database error:", error);
            return new Response(
              JSON.stringify({ error: `Failed to save connection: ${error.message}` }),
              { headers: corsHeaders, status: 500 }
            );
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
          console.error("Facebook OAuth error:", error);
          return new Response(
            JSON.stringify({ error: error.message || "Failed to connect Facebook account" }),
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
        // Always use the same consistent redirect URL
        const redirectUrl = redirectUri || "https://eatmeetclub.com/api/auth/callback/facebook";

        if (!clientId) {
          return new Response(
            JSON.stringify({ error: "Facebook App ID not configured" }),
            { headers: corsHeaders, status: 500 }
          );
        }

        console.log(`Initiating Instagram OAuth flow with client ID: ${clientId.substring(0, 6)}... and redirect: ${redirectUrl}`);

        // Generate authorization URL using Facebook OAuth dialog with basic permissions only
        // Removed Instagram-specific scopes that require app review
        const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
        authUrl.searchParams.append("client_id", clientId);
        authUrl.searchParams.append("redirect_uri", redirectUrl);
        authUrl.searchParams.append("scope", "public_profile,email"); // Using only public_profile which is available in dev mode
        authUrl.searchParams.append("response_type", "code");
        if (state) {
          authUrl.searchParams.append("state", state);
        }
        
        // Print the full URL for debugging
        console.log("Generated Instagram auth URL (via Facebook):", authUrl.toString());

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
        // Always use the same consistent redirect URL
        const redirectUrl = redirectUri || "https://eatmeetclub.com/api/auth/callback/facebook";

        if (!clientId || !clientSecret) {
          return new Response(
            JSON.stringify({ error: "Facebook App ID or Secret not configured" }),
            { headers: corsHeaders, status: 500 }
          );
        }

        console.log(`Processing Instagram callback with code: ${code.substring(0, 6)}... and redirect: ${redirectUrl}`);

        // Exchange code for access token using Facebook's token endpoint
        try {
          console.log("Attempting to exchange code for token via Facebook...");
          
          const tokenRequestBody = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            redirect_uri: redirectUrl,
            code: code
          });
          
          console.log("Token request params:", {
            url: "https://graph.facebook.com/v19.0/oauth/access_token",
            client_id_prefix: clientId.substring(0, 6) + "...",
            redirect_uri: redirectUrl,
          });
          
          const tokenResponse = await fetch("https://graph.facebook.com/v19.0/oauth/access_token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: tokenRequestBody
          });

          const responseText = await tokenResponse.text();
          console.log("Raw token response:", responseText);
          
          let tokenData;
          try {
            tokenData = JSON.parse(responseText);
          } catch (e) {
            console.error("Error parsing token response:", e);
            return new Response(
              JSON.stringify({ error: "Failed to parse token response", raw: responseText }),
              { headers: corsHeaders, status: 500 }
            );
          }
          
          if (!tokenResponse.ok || tokenData.error) {
            console.error("Facebook/Instagram token exchange error:", tokenData);
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
            console.error("Error getting user profile:", userData);
            return new Response(
              JSON.stringify({ 
                error: "Failed to get user profile information",
                details: userData.error || "Unknown error"
              }),
              { headers: corsHeaders, status: 400 }
            );
          }
          
          // Since we can't get Instagram data without advanced permissions, store the connection as "partial"
          const { data: connection, error } = await supabase
            .from('social_media_connections')
            .upsert({
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
            }, { onConflict: 'user_id, platform' })
            .select()
            .single();

          if (error) {
            console.error("Database error:", error);
            return new Response(
              JSON.stringify({ error: `Failed to save connection: ${error.message}` }),
              { headers: corsHeaders, status: 500 }
            );
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
          console.error("Instagram OAuth error:", error);
          return new Response(
            JSON.stringify({ 
              error: error.message || "Failed to connect Instagram account",
              stack: error.stack || "No stack trace available"
            }),
            { headers: corsHeaders, status: 500 }
          );
        }
      }
    } else if (platform === "TikTok") {
      if (action === "initiate") {
        // TikTok App credentials - if you had these as env variables
        const clientId = Deno.env.get("TIKTOK_CLIENT_ID");
        const redirectUrl = redirectUri || "http://localhost:5173";

        if (!clientId) {
          return new Response(
            JSON.stringify({ error: "TikTok Client ID not configured" }),
            { headers: corsHeaders, status: 500 }
          );
        }

        // Generate TikTok authorization URL
        const authUrl = new URL("https://open-api.tiktok.com/platform/oauth/connect/");
        authUrl.searchParams.append("client_key", clientId);
        authUrl.searchParams.append("redirect_uri", redirectUrl);
        authUrl.searchParams.append("scope", "user.info.basic");
        authUrl.searchParams.append("response_type", "code");
        authUrl.searchParams.append("state", `tiktok_${Math.random().toString(36).substring(2, 15)}`);

        return new Response(
          JSON.stringify({ authUrl: authUrl.toString() }),
          { headers: corsHeaders, status: 200 }
        );
      } else if (action === "callback") {
        // Handle the TikTok OAuth callback logic here similar to Instagram
        // This would exchange the code for an access token and fetch user data
      }
      
      // Simple mock connection for platforms without OAuth implementation
      const { data: connection, error } = await supabase
        .from('social_media_connections')
        .upsert({
          user_id: user.id,
          platform: platform,
          username: "user_" + Math.random().toString(36).substring(2, 8),
          profile_url: `https://example.com/${platform}`,
          is_connected: true,
          meta_data: { connected_at: new Date().toISOString() }
        }, { onConflict: 'user_id, platform' })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: `Failed to save connection: ${error.message}` }),
          { headers: corsHeaders, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          connection,
          message: `Successfully connected ${platform} account` 
        }),
        { headers: corsHeaders, status: 200 }
      );
    }

    // For other platforms - implement a mock connection
    const { data: connection, error } = await supabase
      .from('social_media_connections')
      .upsert({
        user_id: user.id,
        platform: platform,
        username: "user_" + Math.random().toString(36).substring(2, 8),
        profile_url: `https://example.com/${platform}`,
        is_connected: true,
        meta_data: { connected_at: new Date().toISOString() }
      }, { onConflict: 'user_id, platform' })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: `Failed to save connection: ${error.message}` }),
        { headers: corsHeaders, status: 500 }
      );
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
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        stack: error.stack || "No stack trace available"
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
