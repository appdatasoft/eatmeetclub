
import React, { useState, useRef, useEffect } from 'react';
import { EditableContent } from '@/hooks/useInlineEdit';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X } from 'lucide-react';

interface EditableElementProps {
  children: React.ReactNode;
  id: string;
  pagePath: string;
  contentType?: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (content: EditableContent) => Promise<boolean>;
  onCancel: () => void;
}

const EditableElement: React.FC<EditableElementProps> = ({
  children,
  id,
  pagePath,
  contentType = 'text',
  className = '',
  tag = 'div',
  isEditing,
  onEdit,
  onSave,
  onCancel
}) => {
  const [editedContent, setEditedContent] = useState<string>('');
  const editableRef = useRef<HTMLDivElement>(null);
  const Tag = tag;
  
  useEffect(() => {
    if (isEditing && editableRef.current) {
      // Focus the element when editing starts
      editableRef.current.focus();
      // Place cursor at the end
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  useEffect(() => {
    // Initialize edited content when editing starts
    if (isEditing && typeof children === 'string') {
      setEditedContent(children);
    }
  }, [isEditing, children]);

  const handleContentChange = () => {
    if (editableRef.current) {
      setEditedContent(editableRef.current.innerHTML);
    }
  };

  const handleSave = async () => {
    const content: EditableContent = {
      page_path: pagePath,
      element_id: id,
      content: editedContent,
      content_type: contentType,
    };
    
    await onSave(content);
  };

  // If not editing, render regular element with edit button for admins
  if (!isEditing) {
    return (
      <div className="group relative">
        <Tag className={className} id={id}>
          {children}
        </Tag>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onEdit}
          aria-label="Edit content"
        >
          <Pencil size={16} />
        </Button>
      </div>
    );
  }

  // If editing, render editable element with save/cancel buttons
  return (
    <div className="relative">
      <div
        ref={editableRef}
        contentEditable
        className={`${className} outline-none border border-primary p-2 rounded-md`}
        onInput={handleContentChange}
        dangerouslySetInnerHTML={{ __html: editedContent || '' }}
      />
      <div className="absolute top-2 right-2 flex space-x-1">
        <Button
          variant="outline"
          size="icon"
          onClick={handleSave}
          aria-label="Save content"
        >
          <Check size={16} className="text-green-600" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onCancel}
          aria-label="Cancel editing"
        >
          <X size={16} className="text-red-600" />
        </Button>
      </div>
    </div>
  );
};

export default EditableElement;
