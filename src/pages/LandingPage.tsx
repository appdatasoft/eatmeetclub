
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold mb-6">Welcome to FoodEvents</h1>
        <p className="text-lg mb-8">Discover and book amazing food events at restaurants near you.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Explore Events</h2>
            <p className="mb-4">Browse through our curated list of food events, from cooking classes to tasting menus.</p>
            <a href="/events" className="text-primary hover:underline">Find events &rarr;</a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Host Your Own Event</h2>
            <p className="mb-4">Are you a restaurant owner? Create and host your own food events.</p>
            <a href="/register" className="text-primary hover:underline">Get started &rarr;</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LandingPage;
