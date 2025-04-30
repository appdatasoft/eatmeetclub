
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export interface EventCardProps {
  id: string;
  title: string;
  restaurantName: string;
  restaurantId?: string;
  date: string;
  time: string;
  price: number;
  image: string;
  category: "breakfast" | "lunch" | "dinner";
  location: string;
  userId?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  restaurantName,
  restaurantId,
  date,
  time,
  price,
  image,
  category,
  location,
  userId
}) => {
  // Category badge colors
  const categoryColors = {
    breakfast: "bg-amber-100 text-amber-800",
    lunch: "bg-emerald-100 text-emerald-800",
    dinner: "bg-indigo-100 text-indigo-800",
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
      <div className="relative">
        <Link to={`/event/${id}`}>
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
        </Link>
        <span
          className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
            categoryColors[category]
          }`}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </span>
      </div>

      <CardContent className="p-4 flex-grow">
        <Link to={`/event/${id}`} className="no-underline">
          <h3 className="font-semibold text-lg mb-1 text-gray-900 hover:text-primary transition-colors duration-200">
            {title}
          </h3>
        </Link>

        {restaurantId ? (
          <Link 
            to={`/restaurant/${restaurantId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {restaurantName}
          </Link>
        ) : (
          <p className="text-sm font-medium text-primary">{restaurantName}</p>
        )}

        <div className="mt-3 space-y-1">
          <p className="text-sm text-gray-600">{date} • {time}</p>
          <p className="text-sm text-gray-600">{location}</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-gray-100 mt-auto">
        <span className="font-semibold text-lg">${price}</span>
        
        <div className="flex space-x-2">
          {userId && (
            <Link
              to={`/user/${userId}`}
              className="px-3 py-1 bg-accent text-xs rounded-full hover:bg-accent/80 transition-colors"
            >
              Host
            </Link>
          )}
          <Link
            to={`/event/${id}`}
            className="px-3 py-1 bg-primary text-white text-xs rounded-full hover:bg-primary/80 transition-colors"
          >
            Details
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
