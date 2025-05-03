
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PasswordSuccessMessage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-6">
      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Password Set Successfully!</h2>
      <p className="text-gray-600 mb-4">
        Your password has been set successfully. You can now log in to your account.
      </p>
      <Button onClick={() => navigate("/login")}>
        Go to Login
      </Button>
    </div>
  );
};

export default PasswordSuccessMessage;
