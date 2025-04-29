
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";

const Index = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <FeaturedEvents />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
};

export default Index;
