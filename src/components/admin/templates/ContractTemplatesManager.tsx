
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContractTemplateEditor from './ContractTemplateEditor';
import TemplatesErrorState from './TemplatesErrorState';
import TemplatesLoadingState from './TemplatesLoadingState';
import { useContractTemplates } from '@/hooks/admin/useContractTemplates';

const ContractTemplatesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('venue');
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  
  // We'll initialize the hook with the first tab value, and change it when tabs change
  const { 
    isLoading,
    error, 
    fetchTemplates
  } = useContractTemplates(activeTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await fetchTemplates();
    setIsRetrying(false);
  };

  if (error) {
    return (
      <TemplatesErrorState 
        message={error} 
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    );
  }

  if (isLoading) {
    return <TemplatesLoadingState />;
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Contract templates for restaurant partnerships and user agreements.
        You can edit these templates and add dynamic fields from the database.
      </p>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="venue">Venue Contracts</TabsTrigger>
          <TabsTrigger value="salesRep">Sales Rep Contracts</TabsTrigger>
          <TabsTrigger value="ticket">Ticket Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="venue">
          <ContractTemplateEditor templateType="venue" />
        </TabsContent>
        
        <TabsContent value="salesRep">
          <ContractTemplateEditor templateType="salesRep" />
        </TabsContent>
        
        <TabsContent value="ticket">
          <ContractTemplateEditor templateType="ticket" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractTemplatesManager;
