
import React, { useState, useEffect } from 'react';
import { useContractTemplates } from '@/hooks/admin/useContractTemplates';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';

interface ContractTemplateEditorProps {
  templateType: 'venue' | 'salesRep' | 'ticket';
}

const ContractTemplateEditor: React.FC<ContractTemplateEditorProps> = ({ templateType }) => {
  const [template, setTemplate] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const { toast } = useToast();
  
  const { 
    templateData, 
    availableFields,
    isLoading, 
    isSaving,
    error,
    saveTemplate
  } = useContractTemplates(templateType);

  useEffect(() => {
    if (templateData) {
      setTemplate(templateData.content || '');
    }
  }, [templateData]);

  const handleSave = async () => {
    try {
      if (!templateData?.id) {
        console.error("No template data available");
        toast({
          title: "Error",
          description: "No template selected to save",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Saving template:", {
        id: templateData.id,
        content: template,
        type: templateType
      });
      
      const result = await saveTemplate(template);
      
      if (result) {
        toast({
          title: "Success",
          description: "Template saved successfully"
        });
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const handleInsertField = () => {
    if (selectedField) {
      setTemplate(prev => `${prev} {{${selectedField}}} `);
      setSelectedField('');
    }
  };

  // This translates the template type to a human-readable name
  const getTemplateTitle = () => {
    switch (templateType) {
      case 'venue':
        return 'Venue Contract Template';
      case 'salesRep':
        return 'Sales Rep Contract Template';
      case 'ticket':
        return 'Ticket Sales Contract Template';
      default:
        return 'Contract Template';
    }
  };

  // This renders the preview with placeholders highlighted
  const renderPreview = () => {
    if (!template) return <p>No template content to preview.</p>;

    // Highlight template variables
    const highlightedContent = template.replace(
      /\{\{([^}]+)\}\}/g,
      '<span class="bg-yellow-100 text-yellow-800 px-1 rounded">{{$1}}</span>'
    );

    return <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />;
  };

  if (isLoading) {
    return <div className="py-8">Loading template...</div>;
  }

  if (error) {
    return <div className="py-8 text-red-500">Error loading template: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">{getTemplateTitle()}</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="template-content">Template Content</Label>
              <Textarea
                id="template-content"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={12}
                className="font-mono"
                placeholder="Enter your contract template here..."
              />
            </div>
            
            <div className="flex space-x-4 items-end">
              <div className="flex-1">
                <Label htmlFor="field-selector">Insert Database Field</Label>
                <Select
                  value={selectedField}
                  onValueChange={setSelectedField}
                >
                  <SelectTrigger id="field-selector">
                    <SelectValue placeholder="Select a field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map((field) => (
                      <SelectItem key={field.name} value={field.name}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleInsertField} 
                disabled={!selectedField}
              >
                Insert Field
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" /> Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>{getTemplateTitle()} Preview</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[400px] w-full p-4 rounded border">
                <div className="p-4">
                  {renderPreview()}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !templateData}
          >
            <Save className="mr-2 h-4 w-4" /> Save Template
          </Button>
        </CardFooter>
      </Card>
      
      <div className="p-4 border rounded bg-gray-50">
        <h4 className="text-sm font-medium mb-2">Template Tips:</h4>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li>Use <code>{'{{fieldName}}'}</code> syntax to insert dynamic content.</li>
          <li>Available fields can be inserted using the selector above.</li>
          <li>Preview your template to see how the variables will be highlighted.</li>
        </ul>
      </div>
    </div>
  );
};

export default ContractTemplateEditor;
