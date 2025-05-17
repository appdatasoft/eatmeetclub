
import { CheckCircle2, Mail } from "lucide-react";

interface TicketSuccessHeaderProps {
  emailSent: boolean;
}

const TicketSuccessHeader = ({ emailSent }: TicketSuccessHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-2">Thank You For Your Purchase!</h1>
      <p className="text-gray-600 mb-2">
        Your tickets have been purchased successfully.
      </p>
      {emailSent && (
        <p className="text-gray-600 flex items-center justify-center">
          <Mail className="h-4 w-4 mr-1 text-gray-500" />
          An invoice has been sent to your email
        </p>
      )}
    </div>
  );
};

export default TicketSuccessHeader;
