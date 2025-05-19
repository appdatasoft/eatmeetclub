
import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";
import { useEditableContent } from "@/components/editor/EditableContentProvider";
import DashboardLoadingState from "@/components/layout/dashboard/DashboardLoadingState";

const Index = () => {
  const { isLoading } = useEditableContent();
  
  return (
    <MainLayout>
      <div className="flex flex-col w-full">
        <main className="flex-grow w-full">
          {isLoading ? (
            <DashboardLoadingState message="Loading homepage content..." />
          ) : (
            <Hero />
          )}
          <HowItWorks />
          <FeaturedEvents />
          <Testimonials />
          <CallToAction />
        </main>
      </div>
    </MainLayout>
  );
};

export default Index;
