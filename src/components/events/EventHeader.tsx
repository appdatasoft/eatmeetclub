
import React, { useState } from "react";
import { Edit, Book, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import RestaurantMenuPreview from "./RestaurantMenuPreview";
import SupabaseImage from "@/components/common/SupabaseImage";
import { useAuth } from "@/hooks/useAuth";

interface EventHeaderProps {
  title: string;
  restaurantName: string;
  restaurantId?: string;
  isOwner?: boolean;
  onEditCover?: () => void;
  coverImage?: string;
}

const EventHeader: React.FC<EventHeaderProps> = ({ 
  title, 
  restaurantName,
  restaurantId,
  isOwner = false,
  onEditCover,
  coverImage = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60"
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  
  // For debugging purposes: log the received props
  console.log("EventHeader props:", { title, restaurantName, restaurantId, isOwner, user });

  return (
    <div className="relative h-64 md:h-96 overflow-hidden">
      <SupabaseImage
        src={coverImage}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      
      {/* Fixed positioning and z-index */}
      <div className="absolute top-0 left-0 w-full">
        {/* Edit Cover button on left side */}
        <div className="absolute top-4 left-4">
          {isOwner && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-white/90 hover:bg-white text-gray-800 z-10"
              onClick={onEditCover}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit Cover
            </Button>
          )}
        </div>
        
        {/* View Menu button for all users */}
        <div className="absolute top-4 right-4">
          {restaurantId && restaurantId !== "unknown" && (
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-800 z-10"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Book className="h-4 w-4 mr-1" /> {showMenu ? "Hide Menu" : "View Menu"}
            </Button>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">{title}</h1>
        {restaurantId && restaurantId !== "unknown" ? (
          <Link 
            to={`/restaurant/${restaurantId}`}
            className="text-lg text-white/90 hover:text-white hover:underline"
          >
            Hosted by {restaurantName}
          </Link>
        ) : (
          <p className="text-lg text-white/90">Hosted by {restaurantName}</p>
        )}
      </div>

      {/* Removed the user check to allow all users to view the menu */}
      {showMenu && restaurantId && restaurantId !== "unknown" && (
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <RestaurantMenuPreview restaurantId={restaurantId} />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowMenu(false)}
            className="absolute top-2 right-2 rounded-full p-1 bg-white/90 hover:bg-white text-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventHeader;
