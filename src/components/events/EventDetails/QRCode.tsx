
import React from "react";
import QRCodeReact from "qrcode.react";

interface QRCodeProps {
  url: string;
  eventTitle: string;
}

const QRCode: React.FC<QRCodeProps> = ({ url, eventTitle }) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm border flex flex-col items-center" data-testid="event-qr-code">
      <p className="text-sm text-gray-600 mb-2">Scan to view event</p>
      <QRCodeReact
        value={url}
        size={130}
        level="H"
        includeMargin={true}
        renderAs="svg"
        className="mb-1"
      />
      <p className="text-xs text-center text-gray-500 mt-1">{eventTitle}</p>
    </div>
  );
};

export default QRCode;
