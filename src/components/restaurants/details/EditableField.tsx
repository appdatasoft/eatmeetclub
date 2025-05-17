
import React, { useState, useEffect, useRef } from "react";
import { Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditableFieldProps {
  value: string;
  fieldName: string;
  isMultiline?: boolean;
  label?: string;
  onSave: (value: string) => Promise<void>;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  fieldName,
  isMultiline = false,
  label,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(currentValue);
      setIsEditing(false);
    } catch (error) {
      console.error(`Error saving ${fieldName}:`, error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isMultiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  return (
    <div className="group relative">
      {isEditing ? (
        <div className="space-y-2">
          {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
          <div className="flex items-start gap-2">
            {isMultiline ? (
              <Textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                rows={3}
              />
            ) : (
              <Input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
            )}
            <div className="flex space-x-1">
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 px-2 text-green-600 hover:text-green-700"
                variant="ghost"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-8 px-2 text-red-600 hover:text-red-700"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group">
          {label && <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>}
          <div className="min-h-[1.5rem] break-words">
            {currentValue || <span className="text-gray-400 italic">Not provided</span>}
            <Button
              type="button"
              size="sm"
              onClick={handleEdit}
              className="absolute right-0 top-0 h-6 w-6 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              variant="ghost"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableField;
