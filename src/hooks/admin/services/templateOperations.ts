
import { templates } from '@/lib/fetch-client';
import { useToast } from '@/hooks/use-toast';
import { ContractTemplate } from '../types/contractTemplateTypes';
import { mapToAPITemplateType } from '../utils/templateTypeUtils';

/**
 * Services for performing operations on contract templates
 */
export const useTemplateOperations = () => {
  const { toast } = useToast();

  const fetchTemplates = async (templateType: string) => {
    try {
      const apiTemplateType = mapToAPITemplateType(templateType);
      
      const response = await templates.getAll(apiTemplateType);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      // Convert the response data to our local ContractTemplate type
      return (response.data || []) as ContractTemplate[];
    } catch (err: any) {
      console.error("Error fetching templates:", err);
      throw new Error(err.message || "Failed to load templates");
    }
  };

  const saveTemplate = async (templateId: string, content: string, templateType: string): Promise<boolean> => {
    try {
      const apiTemplateType = mapToAPITemplateType(templateType);
      
      const response = await templates.update(templateId, { 
        content,
        type: apiTemplateType
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: "Template Saved",
        description: "The contract template was successfully updated"
      });
      
      return true;
    } catch (err: any) {
      console.error("Error saving template:", err);
      
      toast({
        title: "Error Saving Template",
        description: err.message || "Failed to save contract template",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const createTemplate = async (template: Partial<ContractTemplate>, templateType: string): Promise<boolean> => {
    try {
      const apiTemplateType = mapToAPITemplateType(templateType);

      // Ensure storage_path is set to match required field
      const newTemplate = {
        ...template,
        type: apiTemplateType,
        storage_path: template.storage_path || `templates/${apiTemplateType}/${Date.now()}`,
        variables: template.variables || []
      };

      const response = await templates.create(newTemplate);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: "Template Created",
        description: "The contract template was successfully created"
      });
      
      return true;
    } catch (err: any) {
      console.error("Error creating template:", err);
      
      toast({
        title: "Error Creating Template",
        description: err.message || "Failed to create contract template",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const updateTemplate = async (id: string, template: Partial<ContractTemplate>): Promise<boolean> => {
    try {
      const response = await templates.update(id, template);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: "Template Updated",
        description: "The contract template was successfully updated"
      });
      
      return true;
    } catch (err: any) {
      console.error("Error updating template:", err);
      
      toast({
        title: "Error Updating Template",
        description: err.message || "Failed to update contract template",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const response = await templates.delete(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: "Template Deleted",
        description: "The contract template was successfully deleted"
      });
      
      return true;
    } catch (err: any) {
      console.error("Error deleting template:", err);
      
      toast({
        title: "Error Deleting Template",
        description: err.message || "Failed to delete contract template",
        variant: "destructive"
      });
      
      return false;
    }
  };

  return {
    fetchTemplates,
    saveTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
};
