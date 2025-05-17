
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import SupabaseImage from "@/components/common/SupabaseImage";

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
      <div className="relative h-48">
        <Link to={`/event/${id}`}>
          {image.startsWith('data:') ? (
            // SVG placeholder case - use as src instead of dangerouslySetInnerHTML
            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
              <img src={image} alt={title} className="h-full w-full object-cover" />
            </div>
          ) : (
            // Use SupabaseImage for actual images
            <SupabaseImage
              src={image}
              alt={title}
              className="h-full w-full object-cover"
              fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23888'%3ENo Event Image%3C/text%3E%3C/svg%3E"
            />
          )}
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
