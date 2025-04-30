
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";

const EmptyTickets: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Ticket className="mr-2 h-5 w-5" />
          My Tickets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center">
          <p className="text-muted-foreground mb-4">You haven't purchased any tickets yet.</p>
          <Button onClick={() => navigate('/events')}>Browse Events</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyTickets;
