
import React from "react";
import { QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface QRCodeProps {
  url: string;
  eventTitle: string;
}

const QRCode: React.FC<QRCodeProps> = ({ url, eventTitle }) => {
  // Generate QR code SVG
  const generateQRCode = () => {
    // Using a simple approach to generate QR code URL via an API
    const encodedUrl = encodeURIComponent(url);
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
    
    return qrApiUrl;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          <span>QR Code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Event QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          <div className="bg-white p-3 rounded-md shadow-sm mb-4">
            <img 
              src={generateQRCode()} 
              alt={`QR Code for ${eventTitle}`} 
              className="w-[200px] h-[200px]" 
            />
          </div>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Scan this QR code to view event details
          </p>
          <p className="text-xs text-center break-all px-4">
            {url}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCode;
