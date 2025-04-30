
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";

interface ErrorTicketsProps {
  onRetry: () => void;
}

const ErrorTickets: React.FC<ErrorTicketsProps> = ({ onRetry }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Ticket className="mr-2 h-5 w-5" />
          My Tickets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Failed to load tickets.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorTickets;
