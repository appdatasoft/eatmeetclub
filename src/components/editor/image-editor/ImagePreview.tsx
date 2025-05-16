
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  imageUrl: string | null;
  onEditClick: () => void;
}

const ImagePreview = ({ imageUrl, onEditClick }: ImagePreviewProps) => {
  if (!imageUrl) return null;
  
  return (
    <div className="relative w-full mb-4">
      <img 
        src={imageUrl} 
        alt="Preview" 
        className="w-full aspect-video object-contain rounded-md bg-gray-50"
      />
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 bg-white/90 hover:bg-white"
        onClick={onEditClick}
      >
        <Pencil size={16} className="mr-1" /> Edit
      </Button>
    </div>
  );
};

export default ImagePreview;
