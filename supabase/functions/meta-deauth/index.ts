
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Meta sends a POST request when a user deauthorizes your app
    if (req.method === "POST") {
      const requestData = await req.json();
      console.log("Received deauth request:", requestData);
      
      // Meta deauthorization data structure
      // {
      //    "signed_request": "[encoded-signed-request]"
      // }
      
      const signedRequest = requestData.signed_request;
      if (!signedRequest) {
        return new Response(
          JSON.stringify({ error: "Invalid request: missing signed_request parameter" }),
          { headers: corsHeaders, status: 400 }
        );
      }
      
      // Decode and verify the signed request
      // The signed request is a dot-separated base64url encoded signature and payload
      const [encodedSig, payload] = signedRequest.split(".");
      
      // Decode the payload from base64url to JSON
      const decodedPayload = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      
      console.log("Decoded payload:", decodedPayload);
      
      // Verify the signature if we have the app secret
      // This verification step is important for security
      const appSecret = Deno.env.get("FACEBOOK_APP_SECRET");
      if (appSecret) {
        try {
          // Convert the encoded signature from base64url to binary
          const signature = atob(encodedSig.replace(/-/g, "+").replace(/_/g, "/"));
          
          // Create an HMAC using the app secret and verify the signature
          const hmac = createHmac("sha256", appSecret);
          hmac.update(payload);
          const expectedSignature = hmac.digest();
          
          // Convert the expected signature to a string for comparison
          const expectedSigBase64 = btoa(String.fromCharCode(...new Uint8Array(expectedSignature)))
            .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
          
          // Verify that signatures match
          if (encodedSig !== expectedSigBase64) {
            console.error("Signature verification failed");
            return new Response(
              JSON.stringify({ error: "Invalid signature" }),
              { headers: corsHeaders, status: 400 }
            );
          }
          
          console.log("Signature verified successfully");
        } catch (error) {
          console.error("Error verifying signature:", error);
          // Continue processing even if verification fails in development
          // In production, you might want to reject the request
        }
      } else {
        console.warn("No app secret available for signature verification");
      }
      
      // Extract the user ID that's revoking access
      const userId = decodedPayload.user_id;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Invalid request: missing user_id in payload" }),
          { headers: corsHeaders, status: 400 }
        );
      }
      
      // Find and disconnect all social media connections for this Facebook user ID
      const { data: connections, error: fetchError } = await supabase
        .from('social_media_connections')
        .select('*')
        .or(`meta_data->facebook_user_id.eq.${userId},meta_data->>facebook_user_id.eq.${userId}`);
      
      if (fetchError) {
        console.error("Error fetching connections:", fetchError);
        return new Response(
          JSON.stringify({ error: "Database error when fetching connections" }),
          { headers: corsHeaders, status: 500 }
        );
      }
      
      if (connections && connections.length > 0) {
        console.log(`Found ${connections.length} connections to disconnect`);
        
        // Delete the connections
        const { error: deleteError } = await supabase
          .from('social_media_connections')
          .delete()
          .in('id', connections.map(conn => conn.id));
        
        if (deleteError) {
          console.error("Error deleting connections:", deleteError);
          return new Response(
            JSON.stringify({ error: "Database error when deleting connections" }),
            { headers: corsHeaders, status: 500 }
          );
        }
        
        console.log("Successfully deleted connections for deauthorized user");
      } else {
        console.log("No connections found for the deauthorized user");
      }
      
      // Return success to Meta
      return new Response(
        JSON.stringify({ success: true }),
        { headers: corsHeaders, status: 200 }
      );
    }
    
    // For GET requests, just return a simple success message
    return new Response(
      JSON.stringify({ message: "Meta deauthorization endpoint active" }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
