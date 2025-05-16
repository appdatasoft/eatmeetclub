
import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export interface MediaItem {
  url: string;
  type: "image" | "video";
  id?: string;
}

interface MenuItemMediaUploaderProps {
  initialMediaItems?: MediaItem[];
  onChange: (mediaItems: MediaItem[]) => void;
  restaurantId: string;
  menuItemId?: string;
}

const MenuItemMediaUploader: React.FC<MenuItemMediaUploaderProps> = ({
  initialMediaItems = [],
  onChange,
  restaurantId,
  menuItemId
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMediaItems);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      const newMediaItems = [...mediaItems];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const isVideo = file.type.startsWith('video/');
        const fileName = `${restaurantId}/${menuItemId || 'temp'}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        // Calculate progress based on current file
        setProgress(Math.round((i / files.length) * 100));
        
        console.log('Uploading file:', file.name);
        console.log('Storage path:', `menu-items/${fileName}`);
        
        // Upload file to Supabase storage
        const { data, error } = await supabase.storage
          .from('lovable-uploads')
          .upload(`menu-items/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false,
          });
          
        if (error) {
          console.error('Error uploading file:', error);
          throw error;
        }
        
        console.log('Upload successful:', data);
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('lovable-uploads')
          .getPublicUrl(`menu-items/${fileName}`);
          
        if (publicUrlData) {
          console.log('Public URL:', publicUrlData.publicUrl);
          newMediaItems.push({
            url: publicUrlData.publicUrl,
            type: isVideo ? 'video' : 'image'
          });
        }
      }
      
      setMediaItems(newMediaItems);
      onChange(newMediaItems);
      
      toast({
        title: "Files uploaded successfully",
        description: `${files.length} file(s) have been uploaded`,
        variant: "default",
      });
      
    } catch (error: any) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProgress(100);
      
      // Reset file input
      event.target.value = "";
    }
  };
  
  const removeMediaItem = (index: number) => {
    const newMediaItems = [...mediaItems];
    newMediaItems.splice(index, 1);
    setMediaItems(newMediaItems);
    onChange(newMediaItems);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {mediaItems.map((item, index) => (
          <div key={index} className="relative group">
            {item.type === 'image' ? (
              <div className="w-24 h-24 border rounded-md overflow-hidden bg-gray-100">
                <img 
                  src={item.url} 
                  alt="Menu item" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                <video 
                  src={item.url} 
                  className="w-full h-full object-cover"
                  controls
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => removeMediaItem(index)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      
      <div>
        <input
          id="media-upload"
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
          multiple
        />
        <label htmlFor="media-upload">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            className="w-full"
            asChild
          >
            <div className="flex items-center justify-center cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Images/Videos"}
            </div>
          </Button>
        </label>
      </div>
      
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default MenuItemMediaUploader;
