
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';

export interface MenuItemFormValues {
  name: string;
  description: string;
  price: number;
  ingredients: string[];
}

interface MenuItemFormProps {
  initialValues?: MenuItemFormValues;
  onSubmit: (values: MenuItemFormValues) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ 
  initialValues, 
  onSubmit, 
  isLoading = false,
  onCancel 
}) => {
  const [formValues, setFormValues] = useState<MenuItemFormValues>(initialValues || {
    name: '',
    description: '',
    price: 0,
    ingredients: ['']
  });

  const [ingredientInput, setIngredientInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormValues(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()]
      }));
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormValues(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Food Item Name*</Label>
        <Input
          id="name"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          placeholder="e.g., Margherita Pizza"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formValues.description}
          onChange={handleChange}
          placeholder="Describe this food item..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price*</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={formValues.price}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Ingredients</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formValues.ingredients.map((ingredient, index) => (
            ingredient.trim() && (
              <div key={index} className="bg-accent rounded-full px-3 py-1 flex items-center gap-1">
                <span>{ingredient}</span>
                <button 
                  type="button" 
                  onClick={() => removeIngredient(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            placeholder="Add an ingredient"
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={addIngredient}
            disabled={!ingredientInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Item'}
        </Button>
      </div>
    </form>
  );
};

export default MenuItemForm;
