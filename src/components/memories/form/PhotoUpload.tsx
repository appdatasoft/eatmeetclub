
import { useState } from 'react';
import { FormLabel } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface PhotoUploadProps {
  photoPreview: string | null;
  onPhotoChange: (file?: File) => void;
}

const PhotoUpload = ({ photoPreview, onPhotoChange }: PhotoUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoChange(file);
    }
  };

  return (
    <div className="space-y-3">
      <FormLabel>Memory Photo (Optional)</FormLabel>
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            {photoPreview ? (
              <div className="relative w-full">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => onPhotoChange(undefined)}
                >
                  Change Photo
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or WEBP (Max 5MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoUpload;
