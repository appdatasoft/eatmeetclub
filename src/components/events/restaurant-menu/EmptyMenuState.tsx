
import React from "react";

const EmptyMenuState: React.FC = () => {
  return (
    <div className="bg-white h-full p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Menu</h2>
      <p className="text-gray-600">No menu items available for this restaurant.</p>
    </div>
  );
};

export default EmptyMenuState;
