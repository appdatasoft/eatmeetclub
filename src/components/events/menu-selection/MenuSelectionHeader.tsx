
import React from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const MenuSelectionHeader: React.FC = () => {
  return (
    <DialogHeader role="presentation">
      <DialogTitle>Select Menu Items</DialogTitle>
      <DialogDescription>
        Choose the dishes you're interested in. This will help generate questions for the team game.
      </DialogDescription>
    </DialogHeader>
  );
};

export default MenuSelectionHeader;
