
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface MenuSelectionFooterProps {
  selectedCount: number;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const MenuSelectionFooter: React.FC<MenuSelectionFooterProps> = ({
  selectedCount,
  saving,
  onCancel,
  onSave
}) => {
  return (
    <DialogFooter>
      <div className="flex justify-between w-full">
        <div className="text-sm text-muted-foreground pt-2">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Selections
          </Button>
        </div>
      </div>
    </DialogFooter>
  );
};

export default MenuSelectionFooter;
