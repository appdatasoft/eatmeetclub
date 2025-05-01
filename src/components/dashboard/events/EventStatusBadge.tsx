
import { CheckCircle, AlertCircle, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventStatusBadgeProps {
  paymentStatus: string;
  isPublished?: boolean;
  className?: string;
}

export const PublishedBadge = ({ className }: { className?: string }) => (
  <Badge className={`bg-green-100 text-green-800 hover:bg-green-200 ${className || ''}`}>
    <Globe className="h-3 w-3 mr-1" /> Published
  </Badge>
);

const EventStatusBadge = ({ paymentStatus, className }: EventStatusBadgeProps) => {
  if (paymentStatus === 'completed') {
    return (
      <Badge className={`bg-green-100 text-green-800 hover:bg-green-200 ${className || ''}`}>
        <CheckCircle className="h-3 w-3 mr-1" /> Paid
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className={`border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 ${className || ''}`}>
      <AlertCircle className="h-3 w-3 mr-1" /> Payment Required
    </Badge>
  );
};

export default EventStatusBadge;
