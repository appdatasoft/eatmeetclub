
import React from 'react';
import { useEditableContent } from './EditableContentProvider';
import { Pencil, Eye } from 'lucide-react';

export const EditModeToggle = () => {
  const { canEdit, editModeEnabled, toggleEditMode } = useEditableContent();

  if (!canEdit) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-center">
        {editModeEnabled && <span className="mr-3 text-gray-700 font-medium">Admin Tools:</span>}
        <button
          onClick={toggleEditMode}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all
            ${editModeEnabled 
              ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200" 
              : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"}
          `}
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
