
import React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadButtonProps {
  isUploading: boolean;
  inputId: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({ isUploading, inputId }) => {
  return (
    <div>
      <label htmlFor={inputId}>
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
  );
};

export default UploadButton;
