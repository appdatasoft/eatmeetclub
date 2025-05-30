
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AlertCircle } from "lucide-react";

const RestaurantErrorState: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container-custom py-12 text-center">
          <div className="mb-6 text-red-500">
            <AlertCircle size={50} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-6">The restaurant you're looking for doesn't exist or has been removed.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => navigate("/venues")}>Browse Venues</Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RestaurantErrorState;
