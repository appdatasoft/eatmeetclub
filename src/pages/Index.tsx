
import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HeroContent from '@/components/home/HeroContent';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedEvents from '@/components/home/FeaturedEvents';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import SupabaseConnectionTester from '@/components/debug/SupabaseConnectionTester';
import { useAuth } from '@/hooks/useAuth';
import { useEditableContent } from '@/components/editor/EditableContentProvider';

const Index = () => {
  const { user, isAdmin } = useAuth();
  const { canEdit } = useEditableContent();
  
  useEffect(() => {
    console.log('ADMIN_DEBUG: Home page - user:', user?.email, 'isAdmin:', isAdmin, 'canEdit:', canEdit);
  }, [user, isAdmin, canEdit]);
  
  return (
    <MainLayout>
      <Hero>
        <HeroContent />
      </Hero>
      
      {/* Debug info panel */}
      <div className="container mx-auto p-4 mt-4 mb-4 bg-white border rounded-md shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Admin Status Debug Info:</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">User Email:</div>
          <div>{user?.email || 'Not logged in'}</div>
          
          <div className="font-medium">Auth State:</div>
          <div>{user ? 'Logged In' : 'Not Logged In'}</div>
          
          <div className="font-medium">Is Admin:</div>
          <div className={isAdmin ? 'text-green-600 font-bold' : 'text-red-600'}>
            {isAdmin ? 'YES' : 'NO'}
          </div>
          
          <div className="font-medium">Can Edit:</div>
          <div className={canEdit ? 'text-green-600 font-bold' : 'text-red-600'}>
            {canEdit ? 'YES' : 'NO'}
          </div>
        </div>
      </div>
      
      {/* Add connection tester for debugging */}
      <div className="container mx-auto px-4 py-4 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Debug Tools</h2>
        <SupabaseConnectionTester />
      </div>
      
      <HowItWorks />
      <FeaturedEvents />
      <Testimonials />
      <CallToAction />
    </MainLayout>
  );
};

export default Index;
