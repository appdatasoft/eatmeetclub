
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";
import { useEditableContent } from "@/components/editor/EditableContentProvider";
import EditModeToggle from "@/components/editor/EditModeToggle";

const Index = () => {
  const { isLoading, canEdit } = useEditableContent();
  
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      {canEdit && <EditModeToggle />}
      <main className="flex-grow w-full">
        {isLoading ? (
          <div className="py-12 md:py-24 flex items-center justify-center bg-gray-200">
            <p>Loading content...</p>
          </div>
        ) : (
          <Hero />
        )}
        <HowItWorks />
        <FeaturedEvents />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
