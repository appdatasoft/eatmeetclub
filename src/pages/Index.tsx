
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";
import { useEditableContent } from "@/components/editor/EditableContentProvider";

const Index = () => {
  const { isLoading } = useEditableContent();
  
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-grow w-full">
        {isLoading ? (
          <div className="h-[500px] md:h-[700px] flex items-center justify-center bg-gray-200">
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
