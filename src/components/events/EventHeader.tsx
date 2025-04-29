
import React from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventHeaderProps {
  title: string;
  restaurantName: string;
  isOwner?: boolean;
  onEditCover?: () => void;
  coverImage?: string;
}

const EventHeader: React.FC<EventHeaderProps> = ({ 
  title, 
  restaurantName, 
  isOwner = false,
  onEditCover,
  coverImage = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60"
}) => {
  return (
    <div className="relative h-64 md:h-96 overflow-hidden">
      <img
        src={coverImage}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      
      {isOwner && (
        <Button 
          variant="secondary" 
          size="sm" 
          className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800"
          onClick={onEditCover}
        >
          <Edit className="h-4 w-4 mr-1" /> Edit Cover
        </Button>
      )}
      
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">{title}</h1>
        <p className="text-lg text-white/90">Hosted by {restaurantName}</p>
      </div>
    </div>
  );
};

export default EventHeader;
