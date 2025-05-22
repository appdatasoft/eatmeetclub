
import React from 'react';
import { useEditableContent } from './EditableContentProvider';
import { Pencil, Eye } from 'lucide-react';

export const EditModeToggle = () => {
  const { canEdit, editModeEnabled, toggleEditMode } = useEditableContent();

  // Only render the component if user can edit content
  if (!canEdit) return null;

  return (
    <div className="w-full bg-gray-50 py-2 border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container-custom flex justify-between items-center">
        <span className="text-gray-700 font-medium">Admin Tools:</span>
        <button
          onClick={toggleEditMode}
          className={`
            flex items-center gap-2 px-6 py-2 rounded-full transition-all
            ${editModeEnabled 
              ? "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200" 
              : "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"}
          `}
          data-testid="edit-mode-toggle"
        >
          {editModeEnabled ? (
            <>
              <Eye className="h-4 w-4" />
              Exit Edit Mode
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              Edit Mode
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditModeToggle;
