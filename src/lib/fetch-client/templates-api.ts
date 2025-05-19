
/**
 * Templates API service
 */

import { supabase } from "@/integrations/supabase/client";
import { ContractTemplate, FetchResponse, FetchClientOptions } from "./types";
import { get, post, put, del } from "./core";

// Templates API - updated to match Supabase schema
export const templates = {
  getAll: <T = ContractTemplate[]>(type: "restaurant" | "restaurant_referral" | "ticket_sales", customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    return get<T>(`/api/templates/${type}`, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        console.log("Using Supabase fallback to fetch templates of type:", type);
        const { data, error } = await supabase
          .from('contract_templates')
          .select('*')
          .eq('type', type);
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        console.log("Fetched from Supabase:", data);
        return data;
      }
    });
  },
  
  get: <T = ContractTemplate>(id: string, customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    return get<T>(`/api/templates/${id}`, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        console.log("Using Supabase fallback to fetch template by ID:", id);
        const { data, error } = await supabase
          .from('contract_templates')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        return data;
      }
    });
  },
  
  create: <T = ContractTemplate>(template: Partial<ContractTemplate>, customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    // Ensure required fields are present for Supabase schema
    if (!template.type) {
      throw new Error('Template type is required');
    }
    
    // Handle variables properly - ensure it's a JSON object in the database
    const dbTemplate = {
      ...template,
      storage_path: template.storage_path || `templates/${template.type}/${Date.now()}`,
      name: template.name || 'Untitled Template',
      type: template.type, // Ensure type is present and correctly typed
      variables: typeof template.variables === 'object' ? 
        JSON.stringify(template.variables || {}) : 
        template.variables || '{}'
    };
    
    console.log("Creating template with data:", dbTemplate);

    return post<T>('/api/templates', dbTemplate, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        console.log("Using Supabase fallback to create template");
        const { data, error } = await supabase
          .from('contract_templates')
          .insert(dbTemplate)
          .select()
          .single();
          
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        return data;
      }
    });
  },
  
  update: <T = ContractTemplate>(id: string, template: Partial<ContractTemplate>, customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    // Make sure we're sending a proper update payload
    const dbTemplate: Partial<ContractTemplate> = { ...template };
    
    // Ensure variables is a valid JSON string or object for the database
    if (dbTemplate.variables) {
      try {
        // Convert to string if it's not already a string
        if (typeof dbTemplate.variables !== 'string') {
          dbTemplate.variables = JSON.stringify(dbTemplate.variables);
        }
      } catch (err) {
        console.error('Error processing template variables:', err);
        // Fallback to empty object if serialization fails
        dbTemplate.variables = '{}';
      }
    }
    
    console.log("Updating template with ID:", id);
    console.log("Update payload:", dbTemplate);
    
    return put<T>(`/api/templates/${id}`, dbTemplate, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        console.log("Using Supabase fallback to update template:", id);
        try {
          // If variables is a string, parse it back to an object for Supabase
          if (typeof dbTemplate.variables === 'string') {
            try {
              dbTemplate.variables = JSON.parse(dbTemplate.variables) as Record<string, unknown>;
            } catch (e) {
              console.warn("Could not parse variables as JSON, using as is");
              // Keep as string if parsing fails
            }
          }
          
          const { data, error } = await supabase
            .from('contract_templates')
            .update(dbTemplate)
            .eq('id', id)
            .select()
            .single();
            
          if (error) {
            console.error("Supabase update error:", error);
            throw error;
          }
          
          console.log("Supabase update response:", data);
          return data;
        } catch (err) {
          console.error("Error in Supabase fallback for update:", err);
          throw err;
        }
      }
    });
  },
  
  delete: <T = any>(id: string, customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    return del<T>(`/api/templates/${id}`, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        console.log("Using Supabase fallback to delete template:", id);
        const { error } = await supabase
          .from('contract_templates')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        return { success: true };
      }
    });
  },
  
  // New method for sending test emails
  sendTestEmail: async <T = any>(emailData: {
    recipients: string[];
    subject: string;
    content: string;
    templateId?: string;
  }, customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    console.log("Sending test email:", emailData);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        throw new Error("Not authenticated");
      }
      
      // Call the send-custom-email edge function
      const response = await fetch(`${window.location.origin}/functions/send-custom-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          to: emailData.recipients,
          subject: emailData.subject,
          html: emailData.content,
          emailType: 'template-test',
          preventDuplicate: false,
          forceSend: true
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to send email");
      }
      
      return { data: result, error: null };
    } catch (error: any) {
      console.error("Error sending test email:", error);
      return { data: null, error: { message: error.message, status: error.status || 500 } };
    }
  }
};
