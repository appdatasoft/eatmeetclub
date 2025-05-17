
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface IngredientsInputProps {
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

const IngredientsInput: React.FC<IngredientsInputProps> = ({ 
  ingredients, 
  onIngredientsChange 
}) => {
  const [ingredientInput, setIngredientInput] = useState('');

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      onIngredientsChange([...ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    onIngredientsChange(updatedIngredients);
  };

  return (
    <div className="space-y-2">
      <Label className="text-gray-900">Ingredients</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {ingredients.map((ingredient, index) => (
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
          className="flex-1 bg-white border-gray-300"
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
  );
};

export default IngredientsInput;
