
import { Resend } from "npm:resend@1.0.0";

// Initialize Resend with API key
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("RESEND_API_KEY is not set!");
}

export const resend = new Resend(resendApiKey);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to safely parse dates
export function parseAndFormatDate(dateString: string, fallback = new Date()): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallback.toLocaleDateString();
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (err) {
    console.error("Error parsing date:", err);
    return fallback.toLocaleDateString();
  }
}

// Helper function to parse numeric values safely
export function safeParseFloat(value: string | number | undefined, defaultValue = 0): number {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'number') return value;
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function safeParseInt(value: string | number | undefined, defaultValue = 0): number {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'number') return Math.floor(value);
  
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}
