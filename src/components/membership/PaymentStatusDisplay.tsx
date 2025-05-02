
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface PaymentStatusDisplayProps {
  message?: string;
}

const PaymentStatusDisplay: React.FC<PaymentStatusDisplayProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500">{message}</p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentStatusDisplay;
