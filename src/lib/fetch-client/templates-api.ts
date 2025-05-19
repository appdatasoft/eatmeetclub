
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
    
    const dbTemplate = {
      ...template,
      storage_path: template.storage_path || `templates/${template.type}/${Date.now()}`,
      name: template.name || 'Untitled Template',
      type: template.type // Ensure type is present and correctly typed
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
    
    console.log("Updating template with ID:", id);
    console.log("Update payload:", dbTemplate);
    
    return put<T>(`/api/templates/${id}`, dbTemplate, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        console.log("Using Supabase fallback to update template:", id);
        try {
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
  }
};
