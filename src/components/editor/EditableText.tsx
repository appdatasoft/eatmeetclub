
import React from 'react';
import { useEditableContent } from './EditableContentProvider';
import EditableElement from './EditableElement';

interface EditableTextProps {
  id: string;
  defaultContent?: string;
  contentType?: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

const EditableText: React.FC<EditableTextProps> = ({
  id,
  defaultContent,
  contentType = 'text',
  className = '',
  tag = 'div',
  children,
}) => {
  const { contentMap, isEditing, handleEdit, handleSave, handleCancel, canEdit } = useEditableContent();
  
  // Get content from the map if it exists, otherwise use children or defaultContent
  const content = contentMap[id]?.content || (
    typeof children === 'string' ? children : defaultContent || ''
  );
  
  // If user can't edit or no content and no default, render nothing
  if (!canEdit && !content && !children) {
    return null;
  }
  
  // If user can't edit, just render the content
  if (!canEdit) {
    const Tag = tag;
    return <Tag className={className} id={id}>{content || children}</Tag>;
  }
  
  const isCurrentlyEditing = isEditing === id;
  
  return (
    <EditableElement
      id={id}
      pagePath={window.location.pathname}
      contentType={contentType}
      className={className}
      tag={tag}
      isEditing={isCurrentlyEditing}
      onEdit={() => handleEdit(id)}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      {content || children || ''}
    </EditableElement>
  );
};

export default EditableText;
