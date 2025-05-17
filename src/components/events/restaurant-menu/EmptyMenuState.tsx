
import React from "react";
import { Utensils } from "lucide-react";

const EmptyMenuState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div 
        className="bg-gray-100 p-4 rounded-full mb-4"
        data-testid="empty-menu-icon"
      >
        <Utensils className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium mb-2">No menu items available</h3>
      <p className="text-gray-500 max-w-md">
        This restaurant hasn't added any menu items yet.
      </p>
    </div>
  );
};

export default EmptyMenuState;
