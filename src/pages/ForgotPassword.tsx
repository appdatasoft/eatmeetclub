
import React, { useState } from "react";
import { PasswordRecoveryHandler } from "@/components/auth";
import MainLayout from "@/components/layout/MainLayout";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <MainLayout>
      <div className="flex min-h-[70vh] py-12">
        <div className="m-auto w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="flex items-center mb-6">
            <Link to="/login" className="text-gray-500 hover:text-gray-700 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to login</span>
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-gray-600 mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <PasswordRecoveryHandler userEmail="" />
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPassword;
