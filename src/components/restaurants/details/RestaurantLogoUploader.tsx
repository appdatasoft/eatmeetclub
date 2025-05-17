
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { buildStorageUrl } from "@/utils/supabaseStorage";

interface RestaurantLogoUploaderProps {
  restaurantId: string;
  currentLogoUrl: string | null;
  onUploadComplete: (url: string) => void;
}

const RestaurantLogoUploader = ({ 
  restaurantId, 
  currentLogoUrl, 
  onUploadComplete 
}: RestaurantLogoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Generate a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurantId}/logo-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `restaurant-logos/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('lovable-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lovable-uploads')
        .getPublicUrl(filePath);
      
      // Create a placeholder menu item ID - this is required by the schema but we're using this for a logo
      const placeholderMenuItemId = '00000000-0000-0000-0000-000000000000';
        
      // Save the URL to the restaurant_menu_media table
      const { error: dbError } = await supabase
        .from('restaurant_menu_media')
        .insert({
          restaurant_id: restaurantId,
          menu_item_id: placeholderMenuItemId, // Add required field
          url: publicUrl,
          media_type: 'image',
          storage_path: filePath
        });
        
      if (dbError) throw dbError;
      
      onUploadComplete(publicUrl);
      
      toast({
        title: "Logo uploaded",
        description: "Restaurant logo has been updated successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <Avatar className="w-24 h-24 mb-4">
        {currentLogoUrl ? (
          <AvatarImage src={currentLogoUrl} alt="Restaurant logo" className="object-cover" />
        ) : (
          <AvatarFallback>
            <Image className="h-10 w-10 text-gray-400" />
          </AvatarFallback>
        )}
      </Avatar>
      
      <input 
        type="file" 
        id="logo-upload" 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="flex items-center"
        onClick={() => document.getElementById('logo-upload')?.click()}
        disabled={isUploading}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Uploading..." : "Change Logo"}
      </Button>
    </div>
  );
};

export default RestaurantLogoUploader;
