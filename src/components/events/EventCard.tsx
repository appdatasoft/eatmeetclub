
import { Link } from "react-router-dom";

export interface EventCardProps {
  id: string;
  title: string;
  restaurantName: string;
  date: string;
  time: string;
  price: number;
  image: string;
  category: "breakfast" | "lunch" | "dinner";
  location: string;
}

const EventCard = ({
  id,
  title,
  restaurantName,
  date,
  time,
  price,
  image,
  category,
  location,
}: EventCardProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breakfast":
        return "bg-amber-100 text-amber-800";
      case "lunch":
        return "bg-teal-100 text-teal-800";
      case "dinner":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const categoryClass = getCategoryColor(category);

  return (
    <Link to={`/event/${id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${categoryClass}`}>
              {category}
            </span>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-2 text-sm text-gray-500">{restaurantName}</div>
          <h3 className="text-lg font-medium mb-2 group-hover:text-brand-500 transition-colors">
            {title}
          </h3>
          <div className="text-sm text-gray-700 mb-3 flex-1">
            <div className="flex items-center mb-1">
              <svg
                className="w-4 h-4 text-gray-400 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{date}</span>
            </div>
            <div className="flex items-center mb-1">
              <svg
                className="w-4 h-4 text-gray-400 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{time}</span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-gray-400 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{location}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-brand-500 font-medium">${price.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Per person</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
