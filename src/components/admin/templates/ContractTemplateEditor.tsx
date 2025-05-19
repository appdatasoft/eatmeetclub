
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
import { useAdminFees } from '@/hooks/admin/useAdminFees';

interface ContractTemplateEditorProps {
  templateType: 'venue' | 'salesRep' | 'ticket';
}

const ContractTemplateEditor: React.FC<ContractTemplateEditorProps> = ({ templateType }) => {
  const [template, setTemplate] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const { fees } = useAdminFees();
  
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

  // Get current date information for preview
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

  // This renders the preview with placeholders highlighted and fee values substituted
  const renderPreview = () => {
    if (!template) return <p>No template content to preview.</p>;

    // Replace fee variables and date variables with actual values if available
    let previewContent = template;
    const dateInfo = getCurrentDateInfo();
    
    if (fees) {
      previewContent = previewContent.replace(
        /\{\{restaurant_monthly_fee\}\}/g, 
        fees.restaurant_monthly_fee.toString()
      );
      previewContent = previewContent.replace(
        /\{\{signup_commission_value\}\}/g, 
        fees.signup_commission_value.toString()
      );
      previewContent = previewContent.replace(
        /\{\{signup_commission_type\}\}/g, 
        fees.signup_commission_type
      );
      previewContent = previewContent.replace(
        /\{\{ticket_commission_value\}\}/g, 
        fees.ticket_commission_value.toString()
      );
      previewContent = previewContent.replace(
        /\{\{ticket_commission_type\}\}/g, 
        fees.ticket_commission_type
      );
    }
    
    // Replace date variables
    previewContent = previewContent.replace(
      /\{\{current_date\}\}/g, 
      dateInfo.current_date
    );
    previewContent = previewContent.replace(
      /\{\{current_month\}\}/g, 
      dateInfo.current_month
    );
    previewContent = previewContent.replace(
      /\{\{days_in_month\}\}/g, 
      dateInfo.days_in_month.toString()
    );
    
    // Highlight template variables
    const highlightedContent = previewContent.replace(
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
            
            <div className="bg-slate-50 p-3 rounded text-sm">
              <h4 className="font-medium mb-1">Available Template Variables</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <h5 className="font-medium">Fee Values:</h5>
                  {fees && (
                    <ul className="space-y-1">
                      <li><span className="font-medium">Monthly Fee:</span> ${fees.restaurant_monthly_fee}</li>
                      <li>
                        <span className="font-medium">Signup Commission:</span> {fees.signup_commission_value}{fees.signup_commission_type === 'percentage' ? '%' : ' (flat)'}
                      </li>
                      <li>
                        <span className="font-medium">Ticket Sales Commission:</span> {fees.ticket_commission_value}{fees.ticket_commission_type === 'percentage' ? '%' : ' (flat)'}
                      </li>
                    </ul>
                  )}
                </div>
                <div className="space-y-1">
                  <h5 className="font-medium">Date Information:</h5>
                  <ul className="space-y-1">
                    <li><span className="font-medium">Today's Date:</span> {getCurrentDateInfo().current_date}</li>
                    <li><span className="font-medium">Current Month:</span> {getCurrentDateInfo().current_month}</li>
                    <li><span className="font-medium">Days in Month:</span> {getCurrentDateInfo().days_in_month}</li>
                  </ul>
                </div>
              </div>
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
          <li>Fee values like <code>{'{{restaurant_monthly_fee}}'}</code> will be replaced with their current database values.</li>
          <li>Date fields like <code>{'{{current_date}}'}</code>, <code>{'{{current_month}}'}</code>, and <code>{'{{days_in_month}}'}</code> are automatically populated.</li>
          <li>Preview your template to see how the variables will be highlighted.</li>
        </ul>
      </div>
    </div>
  );
};

export default ContractTemplateEditor;
