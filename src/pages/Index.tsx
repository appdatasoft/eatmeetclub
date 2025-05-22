
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HeroContent from '@/components/home/HeroContent';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedEvents from '@/components/home/FeaturedEvents';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import SupabaseConnectionTester from '@/components/debug/SupabaseConnectionTester';

const Index = () => {
  return (
    <MainLayout>
      <Hero>
        <HeroContent />
      </Hero>
      
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
