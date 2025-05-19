
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
        const { data, error } = await supabase
          .from('contract_templates')
          .select('*')
          .eq('type', type);
        
        if (error) throw error;
        return data;
      }
    });
  },
  
  get: <T = ContractTemplate>(id: string, customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    return get<T>(`/api/templates/${id}`, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        const { data, error } = await supabase
          .from('contract_templates')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
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

    return post<T>('/api/templates', dbTemplate, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        const { data, error } = await supabase
          .from('contract_templates')
          .insert(dbTemplate)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    });
  },
  
  update: <T = ContractTemplate>(id: string, template: Partial<ContractTemplate>, customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    // Ensure the type is properly typed for Supabase
    const dbTemplate: Partial<ContractTemplate> = { ...template };
    
    return put<T>(`/api/templates/${id}`, dbTemplate, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        const { data, error } = await supabase
          .from('contract_templates')
          .update(dbTemplate)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    });
  },
  
  delete: <T = any>(id: string, customOptions: FetchClientOptions = {}): Promise<FetchResponse<T>> => {
    return del<T>(`/api/templates/${id}`, {
      ...customOptions,
      fallbackToSupabase: true,
      supabseFallbackFn: async () => {
        const { error } = await supabase
          .from('contract_templates')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return { success: true };
      }
    });
  }
};
