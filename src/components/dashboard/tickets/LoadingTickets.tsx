
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";

const LoadingTickets: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Ticket className="mr-2 h-5 w-5" />
          My Tickets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingTickets;
