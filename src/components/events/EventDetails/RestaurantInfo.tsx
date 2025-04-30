
import React from "react";
import { Link } from "react-router-dom";

interface RestaurantInfoProps {
  id?: string;
  name: string;
  description?: string;
}

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ id, name, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">About the Restaurant</h2>
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1581954548122-53a79ddb74f9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80" 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          {id ? (
            <Link to={`/restaurant/${id}`} className="font-medium hover:text-primary hover:underline">
              {name}
            </Link>
          ) : (
            <h3 className="font-medium">{name}</h3>
          )}
          <p className="text-sm text-gray-500">Serving delicious meals</p>
        </div>
      </div>
      <p className="text-gray-700 mb-4">
        {description || 
          `${name} specializes in sustainable, locally-sourced cuisine with a focus on seasonal ingredients. 
          Our restaurant has been serving the community with a commitment to quality and hospitality.`}
      </p>
      
      {id && (
        <Link 
          to={`/restaurant/${id}`}
          className="text-primary hover:underline font-medium"
        >
          View Restaurant Profile
        </Link>
      )}
    </div>
  );
};

export default RestaurantInfo;
