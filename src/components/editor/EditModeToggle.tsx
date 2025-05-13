
import React from 'react';
import { useEditableContent } from './EditableContentProvider';
import { Button } from '@/components/ui/button';
import { Pencil, Eye } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const EditModeToggle = () => {
  const { canEdit, editModeEnabled, toggleEditMode } = useEditableContent();

  if (!canEdit) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={editModeEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleEditMode}
            className={`fixed bottom-6 right-6 z-50 shadow-md ${
              editModeEnabled 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-white/80 hover:bg-white border-gray-300"
            }`}
          >
            {editModeEnabled ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Exit Edit Mode
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Mode
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{editModeEnabled ? "Switch to view mode" : "Switch to edit mode"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EditModeToggle;
