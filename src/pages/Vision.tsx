
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Vision = () => {
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-center mb-8">
              Our Vision
            </h1>
            
            <div className="text-lg space-y-6">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h2 className="text-2xl font-serif text-brand-500 mb-4">
                  🌍 EatMeetClub Vision
                </h2>
                <p className="text-gray-700 mb-6 text-xl italic">
                  To rebuild local community from the dinner table out — by uniting neighbors through food, games, and civic purpose.
                </p>
                <p className="text-gray-600 mb-6">
                  EatMeetClub is where people disconnect from distractions and reconnect with each other, their neighborhoods, and their voice in shaping the place they live. It's a movement to restore real connection, support local restaurants, and make civic life feel human, playful, and meaningful again.
                </p>
                <p className="text-gray-600">
                  This vision stands against isolation, consumer manipulation, and digital numbness.
                  And it stands for joy, belonging, and rootedness.
                </p>
              </div>
              
              <div className="text-center pt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Join Our Community</h3>
                <p className="text-gray-600 mb-6">
                  Be part of the movement to rebuild local communities through shared meals and meaningful connections.
                </p>
                <a 
                  href="/events" 
                  className="inline-block bg-brand-500 text-white px-6 py-3 rounded-lg hover:bg-brand-600 transition-colors"
                >
                  Browse Events
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Vision;
