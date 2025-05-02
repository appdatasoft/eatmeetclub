
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface PaymentStatusDisplayProps {
  message?: string;
  showSpinner?: boolean;
}

const PaymentStatusDisplay: React.FC<PaymentStatusDisplayProps> = ({ 
  message = "Loading...",
  showSpinner = true
}) => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          {showSpinner && (
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          )}
          <p className="text-gray-500">{message}</p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentStatusDisplay;
