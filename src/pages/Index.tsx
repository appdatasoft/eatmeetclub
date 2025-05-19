
import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";
import DashboardLoadingState from "@/components/layout/dashboard/DashboardLoadingState";
import { EditableContentProvider } from "@/components/editor/EditableContentProvider";

const Index = () => {
  return (
    <EditableContentProvider>
      <MainLayout>
        <div className="flex flex-col w-full">
          <main className="flex-grow w-full">
            <Hero />
            <HowItWorks />
            <FeaturedEvents />
            <Testimonials />
            <CallToAction />
          </main>
        </div>
      </MainLayout>
    </EditableContentProvider>
  );
};

export default Index;
