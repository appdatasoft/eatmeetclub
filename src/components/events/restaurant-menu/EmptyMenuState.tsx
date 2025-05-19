
import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

const EmptyMenuState = () => {
  return (
    <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <UtensilsCrossed className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">No menu items found</h3>
      <p className="text-sm text-gray-500 mt-1">
        This restaurant hasn't added any menu items yet.
      </p>
    </div>
  );
};

export default EmptyMenuState;
