
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { ExternalLink } from "lucide-react";

interface QRCodeProps {
  url: string;
  eventTitle: string;
}

const QRCode: React.FC<QRCodeProps> = ({ url, eventTitle }) => {
  return (
    <div 
      className="rounded-lg bg-white p-4 shadow-sm border flex flex-col items-center" 
      data-testid="event-qr-code"
    >
      <p className="text-sm text-gray-600 mb-2">Scan to view event</p>
      <div className="relative">
        <QRCodeSVG
          value={url}
          size={130}
          level="H"
          includeMargin={true}
          className="mb-1"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-primary/80 text-white p-2 rounded-full"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
      <p className="text-xs text-center text-gray-500 mt-1">{eventTitle}</p>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-xs text-primary hover:underline mt-2 flex items-center"
      >
        <span>Open link</span>
        <ExternalLink size={12} className="ml-1" />
      </a>
    </div>
  );
};

export default QRCode;
