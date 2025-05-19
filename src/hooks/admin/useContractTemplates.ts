
import { useState, useEffect } from 'react';
import { templates } from '@/lib/fetch-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface ContractVariable {
  id: string;
  name: string;
  type: string;
  value?: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  type: string;
  variables: ContractVariable[];
  version?: string;
  is_active?: boolean;
  updated_at?: string;
  created_at?: string;
}

export const useContractTemplates = (templateType: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, [templateType]);

  const fetchTemplates = async () => {
    if (!isAdmin) {
      setError("You must be an admin to manage templates");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await templates.getAll(templateType);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      setContractTemplates(response.data || []);
    } catch (err: any) {
      console.error("Error fetching templates:", err);
      setError(err.message || "Failed to load templates");
      
      // Create a default array if fetch failed to prevent UI errors
      setContractTemplates([]);
      
      toast({
        title: "Error loading templates",
        description: err.message || "Failed to load contract templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (template: Partial<ContractTemplate>): Promise<boolean> => {
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "You must be an admin to create templates",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Ensure the type is set
      const newTemplate = {
        ...template,
        type: templateType,
        variables: template.variables || []
      };

      const response = await templates.create(newTemplate);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      // Add the new template to the state
      setContractTemplates(prev => [...prev, response.data as ContractTemplate]);
      
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
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "You must be an admin to update templates",
        variant: "destructive"
      });
      return false;
    }

    try {
      const response = await templates.update(id, template);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      // Update the template in the state
      setContractTemplates(prev => 
        prev.map(t => t.id === id ? { ...t, ...response.data } as ContractTemplate : t)
      );
      
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
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "You must be an admin to delete templates",
        variant: "destructive"
      });
      return false;
    }

    try {
      const response = await templates.delete(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      // Remove the template from the state
      setContractTemplates(prev => prev.filter(t => t.id !== id));
      
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
    isLoading,
    error,
    contractTemplates,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
};
