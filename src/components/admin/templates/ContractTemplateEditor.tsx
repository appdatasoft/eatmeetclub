
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, PlusCircle, Database } from "lucide-react";
import EditableText from "@/components/editor/EditableText";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface FieldVariable {
  id: string;
  name: string;
  type: string;
  value?: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: FieldVariable[];
}

const databaseFields = [
  { id: "restaurant.name", name: "Restaurant Name", type: "text" },
  { id: "restaurant.address", name: "Restaurant Address", type: "text" },
  { id: "restaurant.city", name: "Restaurant City", type: "text" },
  { id: "restaurant.state", name: "Restaurant State", type: "text" },
  { id: "restaurant.zipcode", name: "Restaurant Zip", type: "text" },
  { id: "restaurant.phone", name: "Restaurant Phone", type: "text" },
  { id: "user.fullName", name: "User Full Name", type: "text" },
  { id: "user.email", name: "User Email", type: "email" },
  { id: "contract.date", name: "Contract Date", type: "date" },
  { id: "contract.term", name: "Contract Term", type: "number" },
  { id: "payment.amount", name: "Payment Amount", type: "currency" },
  { id: "payment.date", name: "Payment Date", type: "date" },
];

// Demo templates data
const initialTemplates: Record<string, ContractTemplate[]> = {
  venue: [
    {
      id: "venue-1",
      name: "Standard Venue Contract",
      description: "Standard contract for restaurant partnerships",
      content: `# VENUE PARTNERSHIP AGREEMENT

This Agreement is made between {{restaurant.name}} and EatMeetClub on {{contract.date}}.

## TERMS AND CONDITIONS

1. **Partnership Term**: {{contract.term}} months
2. **Venue Address**: {{restaurant.address}}, {{restaurant.city}}, {{restaurant.state}} {{restaurant.zipcode}}
3. **Contact Information**: {{restaurant.phone}}

## SIGNATURES

{{user.fullName}}
{{user.email}}`,
      variables: [
        { id: "restaurant.name", name: "Restaurant Name", type: "text" },
        { id: "contract.date", name: "Contract Date", type: "date" },
        { id: "contract.term", name: "Contract Term", type: "number" },
        { id: "restaurant.address", name: "Restaurant Address", type: "text" },
        { id: "restaurant.city", name: "Restaurant City", type: "text" },
        { id: "restaurant.state", name: "Restaurant State", type: "text" },
        { id: "restaurant.zipcode", name: "Restaurant Zip", type: "text" },
        { id: "restaurant.phone", name: "Restaurant Phone", type: "text" },
        { id: "user.fullName", name: "User Full Name", type: "text" },
        { id: "user.email", name: "User Email", type: "email" },
      ]
    }
  ],
  salesRep: [
    {
      id: "sales-1",
      name: "Restaurant Sales Rep Contract",
      description: "Contract for restaurant sales representatives",
      content: `# SALES REPRESENTATIVE AGREEMENT

This Sales Representative Agreement is made between {{user.fullName}} and EatMeetClub on {{contract.date}}.

## TERMS AND CONDITIONS

1. **Term**: {{contract.term}} months
2. **Commission**: {{payment.amount}}% of all sales
3. **Payment Date**: {{payment.date}}

## SIGNATURES

{{user.fullName}}
{{user.email}}`,
      variables: [
        { id: "user.fullName", name: "User Full Name", type: "text" },
        { id: "contract.date", name: "Contract Date", type: "date" },
        { id: "contract.term", name: "Contract Term", type: "number" },
        { id: "payment.amount", name: "Payment Amount", type: "currency" },
        { id: "payment.date", name: "Payment Date", type: "date" },
        { id: "user.email", name: "User Email", type: "email" },
      ]
    }
  ],
  ticket: [
    {
      id: "ticket-1",
      name: "Ticket Sales Contract",
      description: "Contract for event ticket sales",
      content: `# TICKET SALES AGREEMENT

This Ticket Sales Agreement is made between {{user.fullName}} and EatMeetClub on {{contract.date}}.

## TERMS AND CONDITIONS

1. **Event Date**: {{payment.date}}
2. **Ticket Price**: ${{payment.amount}}
3. **Commission**: 15% of all ticket sales

## SIGNATURES

{{user.fullName}}
{{user.email}}`,
      variables: [
        { id: "user.fullName", name: "User Full Name", type: "text" },
        { id: "contract.date", name: "Contract Date", type: "date" },
        { id: "payment.date", name: "Payment Date", type: "date" },
        { id: "payment.amount", name: "Payment Amount", type: "currency" },
        { id: "user.email", name: "User Email", type: "email" },
      ]
    }
  ]
};

const ContractTemplateEditor: React.FC = () => {
  const [templates, setTemplates] = useState<Record<string, ContractTemplate[]>>(initialTemplates);
  const [activeTemplate, setActiveTemplate] = useState<ContractTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [isAddingField, setIsAddingField] = useState(false);
  const [selectedField, setSelectedField] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});

  const handleSaveTemplate = (template: ContractTemplate, tabKey: string) => {
    setTemplates(prev => ({
      ...prev,
      [tabKey]: prev[tabKey].map(t => t.id === template.id ? template : t)
    }));
    setActiveTemplate(null);
    setIsEditingTemplate(false);
  };

  const handleAddField = (templateId: string, tabKey: string) => {
    if (!selectedField) return;
    
    const field = databaseFields.find(f => f.id === selectedField);
    if (!field) return;
    
    setTemplates(prev => ({
      ...prev,
      [tabKey]: prev[tabKey].map(t => {
        if (t.id === templateId) {
          // Check if variable already exists
          if (t.variables.some(v => v.id === field.id)) {
            return t;
          }
          
          return {
            ...t,
            variables: [...t.variables, { ...field }],
            content: `${t.content}\n{{${field.id}}}`
          };
        }
        return t;
      })
    }));
    
    setSelectedField("");
    setIsAddingField(false);
  };

  const handleRemoveField = (templateId: string, fieldId: string, tabKey: string) => {
    setTemplates(prev => ({
      ...prev,
      [tabKey]: prev[tabKey].map(t => {
        if (t.id === templateId) {
          return {
            ...t,
            variables: t.variables.filter(v => v.id !== fieldId),
            content: t.content.replace(new RegExp(`{{${fieldId}}}`, 'g'), '')
          };
        }
        return t;
      })
    }));
  };

  const handleOpenPreview = (template: ContractTemplate) => {
    // Initialize preview values
    const initialValues: Record<string, string> = {};
    template.variables.forEach(v => {
      initialValues[v.id] = v.value || `[${v.name}]`;
    });
    
    setPreviewValues(initialValues);
    setActiveTemplate(template);
    setIsPreviewOpen(true);
  };

  const renderPreview = () => {
    if (!activeTemplate) return null;
    
    let previewContent = activeTemplate.content;
    Object.entries(previewValues).forEach(([key, value]) => {
      previewContent = previewContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    return (
      <div className="whitespace-pre-wrap">
        {previewContent.split('\n').map((line, i) => {
          if (line.startsWith('# ')) {
            return <h1 key={i} className="text-2xl font-bold mb-4">{line.substring(2)}</h1>;
          } else if (line.startsWith('## ')) {
            return <h2 key={i} className="text-xl font-bold mb-3">{line.substring(3)}</h2>;
          } else if (line.startsWith('### ')) {
            return <h3 key={i} className="text-lg font-bold mb-2">{line.substring(4)}</h3>;
          } else {
            return <p key={i} className="mb-2">{line}</p>;
          }
        })}
      </div>
    );
  };

  const renderTemplateContent = (template: ContractTemplate) => {
    return (
      <div className="whitespace-pre-wrap">
        {isEditingTemplate && activeTemplate?.id === template.id ? (
          <div className="space-y-4">
            <textarea
              className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm"
              value={template.content}
              onChange={(e) => {
                setActiveTemplate({
                  ...template,
                  content: e.target.value
                });
              }}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditingTemplate(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSaveTemplate(activeTemplate, getTabKeyForTemplate(template.id))}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <pre className="p-4 bg-gray-50 rounded-md overflow-auto max-h-96 text-sm">
              {template.content}
            </pre>
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setActiveTemplate(template);
                  setIsEditingTemplate(true);
                }}
              >
                Edit Template
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleOpenPreview(template)}
              >
                Preview
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getTabKeyForTemplate = (templateId: string): string => {
    if (templateId.startsWith('venue')) return 'venue';
    if (templateId.startsWith('sales')) return 'salesRep';
    if (templateId.startsWith('ticket')) return 'ticket';
    return 'venue'; // Default fallback
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="venue" className="w-full">
        <TabsList>
          <TabsTrigger value="venue">Venue Contract Templates</TabsTrigger>
          <TabsTrigger value="salesRep">Sales Rep Contract Templates</TabsTrigger>
          <TabsTrigger value="ticket">Ticket Sales Contract Templates</TabsTrigger>
        </TabsList>

        {Object.entries({
          venue: "Venue Contract Templates",
          salesRep: "Restaurant Sales Rep Contract Templates",
          ticket: "Ticket Sales Contract Templates"
        }).map(([key, title]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{title}</h3>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Template
              </Button>
            </div>

            {templates[key]?.map((template) => (
              <Card key={template.id} className="mb-6">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">
                      <EditableText
                        id={`template-name-${template.id}`}
                        defaultContent={template.name}
                        className="text-xl font-bold"
                      />
                    </h3>
                    <p className="text-gray-500">
                      <EditableText
                        id={`template-desc-${template.id}`}
                        defaultContent={template.description}
                      />
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Template Variables</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.variables.map((variable) => (
                        <Badge key={variable.id} variant="secondary" className="flex items-center gap-1 text-sm">
                          {variable.name}
                          <button 
                            onClick={() => handleRemoveField(template.id, variable.id, key)}
                            className="hover:text-red-500 ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                      
                      <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <PlusCircle className="h-3 w-3 mr-1" />
                            Add Field
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Database Field</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex items-center space-x-2">
                              <Database className="h-4 w-4" />
                              <span>Select a field from the database</span>
                            </div>
                            <Select value={selectedField} onValueChange={setSelectedField}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {databaseFields.map(field => (
                                  <SelectItem key={field.id} value={field.id}>
                                    {field.name} ({field.id})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsAddingField(false)}>Cancel</Button>
                              <Button onClick={() => handleAddField(template.id, key)}>Add Field</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Template Content</h4>
                    {renderTemplateContent(template)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Template Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Template Preview: {activeTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Preview Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTemplate?.variables.map(variable => (
                  <div key={variable.id}>
                    <label className="text-xs text-gray-500">{variable.name}</label>
                    <Input
                      value={previewValues[variable.id] || ''}
                      onChange={(e) => setPreviewValues({...previewValues, [variable.id]: e.target.value})}
                      placeholder={variable.name}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 border rounded-lg overflow-auto max-h-[60vh]">
              {renderPreview()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractTemplateEditor;
