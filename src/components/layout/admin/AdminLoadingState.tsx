
import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminLoadingStateProps {
  text?: string;
}

const AdminLoadingState = ({ text = "Loading..." }: AdminLoadingStateProps) => {
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Skeleton */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              </div>
            </div>
            
            {/* Main Content Area Skeleton */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center flex-col py-12">
                  <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-500 font-medium">{text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLoadingState;
