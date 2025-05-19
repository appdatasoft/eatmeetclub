
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTemplateOperations } from './services/templateOperations';
import { ContractTemplate, ContractVariable, DEFAULT_AVAILABLE_FIELDS, UserOption } from './types/contractTemplateTypes';

// Use export type for re-exporting types
export type { ContractTemplate, ContractVariable } from './types/contractTemplateTypes';

export const useContractTemplates = (templateType: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const [templateData, setTemplateData] = useState<ContractTemplate | null>(null);
  const [availableFields, setAvailableFields] = useState<ContractVariable[]>(DEFAULT_AVAILABLE_FIELDS);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const templateOperations = useTemplateOperations();

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
      const templates = await templateOperations.fetchTemplates(templateType);
      setContractTemplates(templates);
      
      // Set the first template as the selected template if available
      if (templates.length > 0) {
        setTemplateData(templates[0]);
      }
    } catch (err: any) {
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
  
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    
    setIsLoadingUsers(true);
    try {
      const users = await templateOperations.fetchUserOptions();
      setUserOptions(users);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      toast({
        title: "Error loading users",
        description: err.message || "Failed to load user list",
        variant: "destructive"
      });
    } finally {
      setIsLoadingUsers(false);
    }
  }, [isAdmin, templateOperations, toast]);

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
      console.log("Saving template:", { 
        id: templateData.id,
        content,
        templateType 
      });
      
      const result = await templateOperations.saveTemplate(
        templateData.id, 
        content,
        templateType
      );
      
      if (result) {
        // Update the template in state
        setTemplateData({
          ...templateData,
          content
        });
        
        setContractTemplates(prev => 
          prev.map(t => t.id === templateData.id ? { ...t, content } : t)
        );
      }
      
      return result;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Fixed implementation: Forward the content and internally use saved state values for recipients and subject
  const sendTestEmail = async (content: string): Promise<boolean> => {
    if (!templateData) {
      toast({
        title: "Error",
        description: "No template selected",
        variant: "destructive"
      });
      return false;
    }
    
    if (selectedRecipients.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one recipient",
        variant: "destructive"
      });
      return false;
    }
    
    if (!emailSubject) {
      toast({
        title: "Error",
        description: "Please enter an email subject",
        variant: "destructive"
      });
      return false;
    }
    
    setIsSaving(true);
    
    try {
      // Use the operation function with all necessary parameters
      return await templateOperations.sendTestEmail(
        selectedRecipients,
        emailSubject,
        content,
        templateData.id
      );
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

    const result = await templateOperations.createTemplate(template, templateType);
    
    if (result) {
      // Refresh templates to get the newly created one
      fetchTemplates();
    }
    
    return result;
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

    const result = await templateOperations.updateTemplate(id, template);
    
    if (result) {
      // Update the template in the state
      setContractTemplates(prev => 
        prev.map(t => t.id === id ? { ...t, ...template } : t)
      );
    }
    
    return result;
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

    const result = await templateOperations.deleteTemplate(id);
    
    if (result) {
      // Remove the template from the state
      setContractTemplates(prev => prev.filter(t => t.id !== id));
      
      // If the deleted template was the selected one, reset templateData
      if (templateData && templateData.id === id) {
        setTemplateData(contractTemplates.find(t => t.id !== id) || null);
      }
    }
    
    return result;
  };

  return {
    isLoading,
    isSaving,
    isLoadingUsers,
    error,
    contractTemplates,
    templateData,
    availableFields,
    userOptions,
    emailSubject,
    setEmailSubject,
    selectedRecipients,
    setSelectedRecipients,
    fetchTemplates,
    fetchUsers,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    saveTemplate,
    sendTestEmail
  };
};
