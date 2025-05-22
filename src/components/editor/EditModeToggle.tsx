
import React from 'react';
import { useEditableContent } from './EditableContentProvider';
import { Pencil, Eye } from 'lucide-react';

export const EditModeToggle = () => {
  const { canEdit, editModeEnabled, toggleEditMode } = useEditableContent();

  if (!canEdit) return null;

  return (
    <div className="fixed top-20 right-6 z-50">
      <button
        onClick={toggleEditMode}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full shadow-md transition-all
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
  );
};

export default EditModeToggle;
