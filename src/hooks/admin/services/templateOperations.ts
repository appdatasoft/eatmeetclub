
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { templates } from '@/lib/fetch-client/templates-api';
import { ContractTemplate } from '../types/contractTemplateTypes';
import { useAdminFees, FeeConfig } from '@/hooks/admin/useAdminFees';
import { mapTemplateType } from '../utils/templateTypeUtils';

export const useTemplateOperations = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { fees } = useAdminFees();
  
  const fetchTemplates = async (templateType: string): Promise<ContractTemplate[]> => {
    setIsLoading(true);
    
    try {
      // Map frontend template type to backend template type
      const backendType = mapTemplateType(templateType);
      
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
      
      return data;
    } catch (error) {
      console.error('Error in fetchTemplates:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveTemplate = async (id: string, content: string, templateType: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log(`Saving template ${id} with content length: ${content.length}`);
      
      const { data, error } = await templates.update(id, { 
        content,
        // Inject fee information into variables field to make them available for the template
        variables: { 
          fees: fees || {} 
        }
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
      const backendType = mapTemplateType(templateType);
      
      console.log(`Creating template for type: ${templateType} (mapped to: ${backendType})`);
      
      // Ensure we have the fees in the template variables
      if (!template.variables) {
        template.variables = {};
      }
      
      template.variables.fees = fees || {};
      
      const { data, error } = await templates.create({
        ...template,
        type: backendType
      });
      
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
      
      // Ensure we have the fees in the template variables
      if (!template.variables) {
        template.variables = {};
      }
      
      template.variables.fees = fees || {};
      
      const { data, error } = await templates.update(id, template);
      
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
    saveTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isLoading
  };
};
