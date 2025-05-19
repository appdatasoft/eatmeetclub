
import { useState, useEffect } from 'react';
import { templates } from '@/lib/fetch-client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface ContractVariable {
  id: string;
  name: string;
  type: string;
  value?: string;
  label?: string;
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
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const [templateData, setTemplateData] = useState<ContractTemplate | null>(null);
  const [availableFields, setAvailableFields] = useState<ContractVariable[]>([
    { id: "restaurant.name", name: "restaurant.name", label: "Restaurant Name", type: "text" },
    { id: "restaurant.address", name: "restaurant.address", label: "Restaurant Address", type: "text" },
    { id: "restaurant.city", name: "restaurant.city", label: "Restaurant City", type: "text" },
    { id: "restaurant.state", name: "restaurant.state", label: "Restaurant State", type: "text" },
    { id: "restaurant.zipcode", name: "restaurant.zipcode", label: "Restaurant Zip", type: "text" },
    { id: "restaurant.phone", name: "restaurant.phone", label: "Restaurant Phone", type: "text" },
    { id: "user.fullName", name: "user.fullName", label: "User Full Name", type: "text" },
    { id: "user.email", name: "user.email", label: "User Email", type: "email" },
    { id: "contract.date", name: "contract.date", label: "Contract Date", type: "date" },
    { id: "contract.term", name: "contract.term", label: "Contract Term", type: "number" },
    { id: "payment.amount", name: "payment.amount", label: "Payment Amount", type: "currency" },
    { id: "payment.date", name: "payment.date", label: "Payment Date", type: "date" },
  ]);
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
      // Change template type to match the expected values in the API
      let apiTemplateType: "restaurant" | "restaurant_referral" | "ticket_sales";
      
      switch(templateType) {
        case "venue":
          apiTemplateType = "restaurant";
          break;
        case "salesRep":
          apiTemplateType = "restaurant_referral";
          break;
        case "ticket":
          apiTemplateType = "ticket_sales";
          break;
        default:
          apiTemplateType = "restaurant";
      }

      const response = await templates.getAll(apiTemplateType);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      setContractTemplates(response.data || []);
      
      // Set the first template as the selected template if available
      if (response.data && response.data.length > 0) {
        setTemplateData(response.data[0]);
      }
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

  const saveTemplate = async (content: string): Promise<boolean> => {
    if (!templateData) {
      toast({
        title: "Error",
        description: "No template selected",
        variant: "destructive"
      });
      return false;
    }
    
    setIsSaving(true);
    
    try {
      const response = await templates.update(templateData.id, { 
        content,
        type: templateData.type
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      // Update the template in state
      setTemplateData({
        ...templateData,
        content
      });
      
      setContractTemplates(prev => 
        prev.map(t => t.id === templateData.id ? { ...t, content } : t)
      );
      
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
    } finally {
      setIsSaving(false);
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
    isSaving,
    error,
    contractTemplates,
    templateData,
    availableFields,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    saveTemplate
  };
};
