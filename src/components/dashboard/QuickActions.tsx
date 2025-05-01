
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks you can perform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={() => navigate('/dashboard/create-event')}
          className="w-full justify-start"
          variant="outline"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Event
        </Button>
        <Button
          onClick={() => navigate('/dashboard/add-restaurant')}
          className="w-full justify-start"
          variant="outline"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Restaurant
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
