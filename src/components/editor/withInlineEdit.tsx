
import React from 'react';
import { useEditableContent } from './EditableContentProvider';
import EditableElement from './EditableElement';

interface WithInlineEditProps {
  id: string;
  contentType?: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
}

const withInlineEdit = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P & WithInlineEditProps) => {
    const { id, contentType = 'text', className, tag = 'div', children, ...rest } = props;
    const { contentMap, isEditing, handleEdit, handleSave, handleCancel, canEdit } = useEditableContent();

    // If user can't edit, just render the component normally
    if (!canEdit) {
      return <Component {...rest as P}>{children}</Component>;
    }

    // Get content from the map if it exists, otherwise use children
    const content = contentMap[id]?.content || (typeof children === 'string' ? children : '');
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
        {content || children}
      </EditableElement>
    );
  };
};

export default withInlineEdit;
