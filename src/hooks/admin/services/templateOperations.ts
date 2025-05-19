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
  
  // Fetch users for email recipients dropdown
  const fetchUserOptions = async (): Promise<UserOption[]> => {
    try {
      // Try to fetch users from auth API
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      
      // Format auth users data into UserOption format
      return (data?.users || []).map(user => {
        const metadata = user.user_metadata || {};
        return {
          id: user.id,
          firstName: metadata.first_name || '',
          lastName: metadata.last_name || '',
          email: user.email || '',
          displayName: `${metadata.first_name || ''} ${metadata.last_name || ''} <${user.email || ''}>`
        };
      });
    } catch (error) {
      console.error('Error in fetchUserOptions:', error);
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
        // Pass the variables as an object, not an array
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
      const templateVars: Record<string, any> = template.variables ? 
        (typeof template.variables === 'string' ? JSON.parse(template.variables) : { ...template.variables }) : {};
      
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
      const templateVars: Record<string, any> = template.variables ? 
        (typeof template.variables === 'string' ? JSON.parse(template.variables) : { ...template.variables }) : {};
      
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
  
  // New method for sending test emails
  const sendTestEmail = async (recipients: string[], subject: string, content: string, templateId?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      if (!recipients.length) {
        toast({
          title: "Recipients required",
          description: "Please select at least one recipient email address",
          variant: "destructive"
        });
        return false;
      }
      
      if (!subject) {
        toast({
          title: "Subject required",
          description: "Please enter an email subject",
          variant: "destructive"
        });
        return false;
      }
      
      console.log(`Sending test email to ${recipients.join(', ')}`);
      
      const { error } = await templates.sendTestEmail({
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
      
      toast({
        title: "Test email sent",
        description: `The test email was sent to ${recipients.join(', ')}`
      });
      return true;
    } catch (error: any) {
      console.error('Error in sendTestEmail:', error);
      toast({
        title: "Error sending test email",
        description: error.message || "An error occurred while sending the test email.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
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
