import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { templates } from '@/lib/fetch-client/templates-api';
import { ContractTemplate, UserOption } from '../types/contractTemplateTypes';
import { useAdminFees, FeeConfig } from '@/hooks/admin/useAdminFees';
import { mapToAPITemplateType } from '../utils/templateTypeUtils';
import { supabase } from "@/integrations/supabase/client";

export const useTemplateOperations = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { fees } = useAdminFees();
  
  const fetchTemplates = async (templateType: string): Promise<ContractTemplate[]> => {
    setIsLoading(true);
    
    try {
      // Map frontend template type to backend template type
      const backendType = mapToAPITemplateType(templateType);
      
      console.log(`Fetching templates for type: ${templateType} (mapped to: ${backendType})`);
      
      const { data, error } = await templates.getAll(backendType);
      
      if (error) {
        console.error('Error fetching templates:', error);
        throw new Error(`Failed to fetch templates: ${error.message}`);
      }
      
      if (!data || !Array.isArray(data)) {
        console.warn(`No templates found for type ${backendType}`);
        // Return empty array instead of throwing
        return [];
      }
      
      console.log(`Fetched ${data.length} templates:`, data);
      
      // Explicitly cast data to meet expected return type
      return data as unknown as ContractTemplate[];
    } catch (error) {
      console.error('Error in fetchTemplates:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get current date information
  const getCurrentDateInfo = () => {
    const now = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Format date as YYYY-MM-DD
    const formattedDate = now.toISOString().split('T')[0];
    
    // Get current month name
    const currentMonth = monthNames[now.getMonth()];
    
    // Get number of days in the current month
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return {
      current_date: formattedDate,
      current_month: currentMonth,
      days_in_month: daysInMonth
    };
  };
  
  // Fixed function to fetch users for email recipients dropdown
  const fetchUserOptions = async (): Promise<UserOption[]> => {
    try {
      // Get the current Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.warn('No authenticated session available');
        return [];
      }
      
      // Use auth.users view to fetch user data instead of 'users' table
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email:auth.users!id(email), raw_user_meta_data:auth.users!id(raw_user_meta_data)')
        .limit(50);
      
      if (error) {
        // If profiles doesn't exist, fall back to direct auth users query via RPC (function call)
        console.log("Falling back to RPC method for user data");
        const { data: users, error: rpcError } = await supabase
          .rpc('get_users_for_admin')
          .limit(50);
        
        if (rpcError) {
          console.error("Error fetching users via RPC:", rpcError);
          throw rpcError;
        }
        
        if (!users) {
          return [];
        }
        
        return users.map((user: any) => {
          const metadata = user.raw_user_meta_data || {};
          return {
            id: user.id,
            firstName: metadata.first_name || '',
            lastName: metadata.last_name || '',
            email: user.email || '',
            displayName: `${metadata.first_name || ''} ${metadata.last_name || ''} <${user.email || ''}>`
          };
        });
      }
      
      console.log("Fetched profiles from Supabase:", profiles);
      
      if (!profiles || profiles.length === 0) {
        return [];
      }
      
      // Format profiles data into UserOption format
      return profiles.map((profile: any) => {
        // Access the joined data correctly
        const userData = profile.raw_user_meta_data || {};
        const email = profile.email?.email || '';
        
        return {
          id: profile.id,
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: email,
          displayName: `${userData.first_name || ''} ${userData.last_name || ''} <${email}>`
        };
      });
    } catch (error) {
      console.error('Error in fetchUserOptions:', error);
      
      // Return empty array when there's an error
      console.log("Returning empty user list due to error");
      return [];
    }
  };
  
  const saveTemplate = async (id: string, content: string, templateType: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log(`Saving template ${id} with content length: ${content.length}`);
      
      // Create a record for variables with fee information
      const templateVars: Record<string, any> = {};
      
      // Add fees if available
      if (fees) {
        templateVars.fees = fees;
      }
      
      // Add current date information
      const dateInfo = getCurrentDateInfo();
      Object.assign(templateVars, dateInfo);
      
      const { data, error } = await templates.update(id, { 
        content,
        variables: templateVars
      });
      
      if (error) {
        console.error('Error saving template:', error);
        toast({
          title: "Failed to save template",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Template saved successfully:', data);
      toast({
        title: "Template saved",
        description: "The template has been updated successfully."
      });
      return true;
    } catch (error: any) {
      console.error('Error in saveTemplate:', error);
      toast({
        title: "Error saving template",
        description: error.message || "An error occurred while saving the template.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const createTemplate = async (template: Partial<ContractTemplate>, templateType: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const backendType = mapToAPITemplateType(templateType);
      
      console.log(`Creating template for type: ${templateType} (mapped to: ${backendType})`);
      
      // Create a record for variables with fee information
      let templateVars: Record<string, any> = {};
      
      if (template.variables) {
        if (typeof template.variables === 'string') {
          try {
            templateVars = JSON.parse(template.variables);
          } catch (e) {
            console.warn("Could not parse template variables");
            templateVars = {};
          }
        } else {
          templateVars = template.variables as Record<string, any>;
        }
      }
      
      // Add fees if available
      if (fees) {
        templateVars.fees = fees;
      }
      
      // Add current date information
      const dateInfo = getCurrentDateInfo();
      Object.assign(templateVars, dateInfo);
      
      const preparedTemplate = {
        ...template,
        variables: templateVars,
        type: backendType
      };
      
      const { data, error } = await templates.create(preparedTemplate as any);
      
      if (error) {
        console.error('Error creating template:', error);
        toast({
          title: "Failed to create template",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Template created successfully:', data);
      toast({
        title: "Template created",
        description: "The template has been created successfully."
      });
      return true;
    } catch (error: any) {
      console.error('Error in createTemplate:', error);
      toast({
        title: "Error creating template",
        description: error.message || "An error occurred while creating the template.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTemplate = async (id: string, template: Partial<ContractTemplate>): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log(`Updating template ${id}:`, template);
      
      // Create a record for variables with fee information
      let templateVars: Record<string, any> = {};
      
      if (template.variables) {
        if (typeof template.variables === 'string') {
          try {
            templateVars = JSON.parse(template.variables);
          } catch (e) {
            console.warn("Could not parse template variables");
            templateVars = {};
          }
        } else {
          templateVars = template.variables as Record<string, any>;
        }
      }
      
      // Add fees if available
      if (fees) {
        templateVars.fees = fees;
      }
      
      // Add current date information
      const dateInfo = getCurrentDateInfo();
      Object.assign(templateVars, dateInfo);
      
      const preparedTemplate = {
        ...template,
        variables: templateVars
      };
      
      const { data, error } = await templates.update(id, preparedTemplate as any);
      
      if (error) {
        console.error('Error updating template:', error);
        toast({
          title: "Failed to update template",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Template updated successfully:', data);
      toast({
        title: "Template updated",
        description: "The template has been updated successfully."
      });
      return true;
    } catch (error: any) {
      console.error('Error in updateTemplate:', error);
      toast({
        title: "Error updating template",
        description: error.message || "An error occurred while updating the template.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Enhanced function to send test emails with both selected users and manually entered emails
  const sendTestEmail = async (recipients: string[], subject: string, content: string, templateId?: string): Promise<boolean> => {
    if (!recipients.length) {
      console.error("No recipients provided");
      return false;
    }
    
    if (!subject) {
      console.error("No subject provided");
      return false;
    }
    
    try {
      console.log(`Sending test email to ${recipients.join(', ')}`);
      console.log("Email subject:", subject);
      console.log("Email content preview:", content.substring(0, 100) + "...");
      
      const { data, error } = await templates.sendTestEmail({
        recipients,
        subject,
        content,
        templateId
      });
      
      if (error) {
        console.error('Error sending test email:', error);
        toast({
          title: "Failed to send test email",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Email sent successfully:", data);
      toast({
        title: "Test email sent",
        description: `Email successfully sent to ${recipients.join(', ')}`
      });
      
      return true;
    } catch (error: any) {
      console.error('Error in sendTestEmail:', error);
      toast({
        title: "Error sending test email",
        description: error.message || "An error occurred while sending the test email",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const deleteTemplate = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log(`Deleting template ${id}`);
      
      const { error } = await templates.delete(id);
      
      if (error) {
        console.error('Error deleting template:', error);
        toast({
          title: "Failed to delete template",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Template deleted successfully');
      toast({
        title: "Template deleted",
        description: "The template has been deleted successfully."
      });
      return true;
    } catch (error: any) {
      console.error('Error in deleteTemplate:', error);
      toast({
        title: "Error deleting template",
        description: error.message || "An error occurred while deleting the template.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    fetchTemplates,
    fetchUserOptions,
    saveTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    sendTestEmail,
    isLoading
  };
};
