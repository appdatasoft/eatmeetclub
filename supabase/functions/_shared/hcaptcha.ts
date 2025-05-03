
/**
 * Utility functions for verifying hCaptcha tokens
 */

const HCAPTCHA_VERIFY_URL = "https://hcaptcha.com/siteverify";

/**
 * Verifies an hCaptcha token against the hCaptcha API
 * 
 * @param token The hCaptcha response token from the frontend
 * @param secretKey The hCaptcha secret key (from environment variables)
 * @param siteKey Optional site key for additional validation
 * @param remoteip Optional IP address of the user
 * @returns Object with verification results
 */
export async function verifyHCaptchaToken(
  token: string,
  secretKey: string,
  siteKey?: string,
  remoteip?: string
) {
  if (!token) {
    console.error("Missing hCaptcha token");
    return { success: false, error: "missing-token" };
  }
  
  if (!secretKey) {
    console.error("Missing hCaptcha secret key");
    return { success: false, error: "missing-secret" };
  }
  
  try {
    // Prepare form data for the verification request
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    
    // Add optional parameters if provided
    if (siteKey) {
      formData.append("sitekey", siteKey);
    }
    
    if (remoteip) {
      formData.append("remoteip", remoteip);
    }
    
    // Make the verification request to hCaptcha
    const response = await fetch(HCAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`hCaptcha verification failed with status ${response.status}:`, errorText);
      return { 
        success: false, 
        status: response.status,
        error: "verification-request-failed",
        details: errorText
      };
    }
    
    const verificationResult = await response.json();
    console.log("hCaptcha verification result:", verificationResult);
    
    return verificationResult;
  } catch (error) {
    console.error("Error verifying hCaptcha token:", error);
    return { 
      success: false, 
      error: "verification-error",
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Middleware function for Supabase Edge Functions to validate hCaptcha tokens
 * 
 * @param request The incoming request object
 * @param secretKey The hCaptcha secret key
 * @param options Additional options for verification
 * @returns Object with success status and potentially the verified request body
 */
export async function validateHCaptchaRequest(
  request: Request,
  secretKey: string,
  options: {
    tokenField?: string;
    siteKey?: string;
    requireToken?: boolean;
  } = {}
) {
  const {
    tokenField = "hcaptchaToken",
    siteKey = undefined,
    requireToken = true
  } = options;
  
  try {
    // Parse the request body
    const contentType = request.headers.get("content-type") || "";
    let body: any = {};
    
    if (contentType.includes("application/json")) {
      body = await request.clone().json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.clone().formData();
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
    } else {
      return { 
        success: false, 
        error: "unsupported-content-type",
        status: 415
      };
    }
    
    // Check for hCaptcha token in the request body
    const token = body[tokenField];
    
    // If token is required but not present, return an error
    if (requireToken && !token) {
      return { 
        success: false, 
        error: "missing-hcaptcha-token",
        status: 400
      };
    }
    
    // If token is not required and not present, skip verification
    if (!requireToken && !token) {
      return { success: true, body };
    }
    
    // Verify the token with hCaptcha
    const verificationResult = await verifyHCaptchaToken(token, secretKey, siteKey);
    
    // If verification failed, return an error
    if (!verificationResult.success) {
      return { 
        success: false, 
        error: "hcaptcha-verification-failed",
        details: verificationResult,
        status: 401
      };
    }
    
    // Return the verified request body
    return { success: true, body, verification: verificationResult };
  } catch (error) {
    console.error("Error validating hCaptcha request:", error);
    return { 
      success: false, 
      error: "validation-error",
      details: error instanceof Error ? error.message : String(error),
      status: 500
    };
  }
}
