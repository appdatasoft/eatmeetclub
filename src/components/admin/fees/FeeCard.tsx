
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Edit, Save, DollarSign, Percent } from 'lucide-react';
import { FeeType } from '@/hooks/admin/useAdminFees';

interface FeeCardProps {
  title: string;
  description?: string;
  value: number;
  type?: FeeType;
  hasTypeOption?: boolean;
  isEditing: boolean;
  isLoading?: boolean;
  onEdit: () => void;
  onSave: (value: number, type?: FeeType) => void;
  onCancel: () => void;
}

const FeeCard: React.FC<FeeCardProps> = ({
  title,
  description,
  value,
  type = 'flat',
  hasTypeOption = false,
  isEditing,
  isLoading,
  onEdit,
  onSave,
  onCancel
}) => {
  const [editValue, setEditValue] = useState(value);
  const [editType, setEditType] = useState<FeeType>(type);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      setEditValue(newValue);
    }
  };

  const handleTypeChange = (newType: FeeType) => {
    setEditType(newType);
  };

  const handleSave = () => {
    onSave(editValue, hasTypeOption ? editType : undefined);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={onEdit} disabled={isLoading}>
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </CardTitle>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`fee-${title.toLowerCase().replace(/\s/g, '-')}`}>Amount</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">
                    {editType === 'percentage' ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                  </span>
                </div>
                <Input
                  id={`fee-${title.toLowerCase().replace(/\s/g, '-')}`}
                  type="number"
                  value={editValue}
                  onChange={handleValueChange}
                  className="pl-8"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {hasTypeOption && (
              <div>
                <Label className="mb-2 block">Fee Type</Label>
                <RadioGroup value={editType} onValueChange={handleTypeChange as any} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flat" id={`${title}-flat`} />
                    <Label htmlFor={`${title}-flat`}>Flat Rate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id={`${title}-percentage`} />
                    <Label htmlFor={`${title}-percentage`}>Percentage</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        ) : (
          <div className="text-2xl font-bold flex items-center">
            {type === 'percentage' ? (
              <>
                {value}
                <Percent className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5" />
                {value.toFixed(2)}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeCard;
