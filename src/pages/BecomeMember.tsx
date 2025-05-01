
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BecomeMember = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/membership-payment");
  }, [navigate]);
  
  return null;
};

export default BecomeMember;
