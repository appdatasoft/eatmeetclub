
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import BasicDetails from './form/BasicDetails';
import IngredientsInput from './form/IngredientsInput';
import FormActions from './form/FormActions';
import MenuItemMediaUploader from './MenuItemMediaUploader';
import { MediaItem } from './types/mediaTypes';
import { MenuItemFormValues } from './types/menuTypes';

interface MenuItemFormProps {
  initialValues?: MenuItemFormValues;
  onSubmit: (values: MenuItemFormValues) => Promise<boolean | void>;
  isLoading?: boolean;
  onCancel?: () => void;
  restaurantId: string;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ 
  initialValues, 
  onSubmit, 
  isLoading = false,
  onCancel,
  restaurantId
}) => {
  const [formValues, setFormValues] = useState<MenuItemFormValues>(initialValues || {
    name: '',
    description: '',
    price: 0,
    type: '',
    ingredients: [''],
    media: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormValues(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleMediaChange = (media: MediaItem[]) => {
    setFormValues(prev => ({
      ...prev,
      media
    }));
  };

  const handleIngredientsChange = (ingredients: string[]) => {
    setFormValues(prev => ({
      ...prev,
      ingredients
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty ingredients
    const filteredValues = {
      ...formValues,
      ingredients: formValues.ingredients.filter(ing => ing.trim() !== '')
    };
    
    await onSubmit(filteredValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-900" role="form">
      <BasicDetails 
        name={formValues.name}
        description={formValues.description}
        price={formValues.price}
        type={formValues.type}
        onNameChange={handleChange}
        onDescriptionChange={handleChange}
        onPriceChange={handleChange}
        onTypeChange={handleTypeChange}
      />

      <div className="space-y-2">
        <Label className="text-gray-900">Images & Videos</Label>
        <MenuItemMediaUploader 
          initialMediaItems={formValues.media}
          onChange={handleMediaChange}
          restaurantId={restaurantId}
          menuItemId={initialValues?.name ? initialValues.name.replace(/\s+/g, '-').toLowerCase() : undefined}
        />
      </div>

      <IngredientsInput 
        ingredients={formValues.ingredients}
        onIngredientsChange={handleIngredientsChange}
      />

      <FormActions 
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </form>
  );
};

export default MenuItemForm;
