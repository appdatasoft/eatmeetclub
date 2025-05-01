
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MembershipPaymentForm from "@/components/membership/MembershipPaymentForm";
import PaymentAlerts from "@/components/membership/PaymentAlerts";
import { useMembershipPayment } from "@/hooks/useMembershipPayment";

const MembershipPayment = () => {
  const {
    membershipFee,
    isLoading,
    isProcessing,
    paymentCanceled,
    paymentSuccess,
    sessionId,
    handleSubmit,
    handleCancel
  } = useMembershipPayment();

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="container-custom">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 bg-brand-500 text-white">
                <h1 className="text-2xl font-bold">Become a Member</h1>
                <p className="mt-1 text-white/90">Join our exclusive community for just ${membershipFee.toFixed(2)}/month</p>
              </div>
              
              <div className="p-6">
                <PaymentAlerts 
                  paymentSuccess={paymentSuccess}
                  sessionId={sessionId}
                  paymentCanceled={paymentCanceled}
                />
                
                {!paymentSuccess && (
                  <MembershipPaymentForm
                    membershipFee={membershipFee}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isProcessing={isProcessing}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MembershipPayment;
