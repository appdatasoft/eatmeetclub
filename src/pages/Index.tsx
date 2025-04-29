import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import { Button } from "@/components/common/Button";
import { Mail, Utensils, Users } from "lucide-react";

const Index = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        
        {/* How It Works Section - Updated with new design */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-10 text-[#0d7b8a]">HOW IT WORKS</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-transparent rounded-full mb-6 border-4 border-[#272163] p-4">
                  <Mail className="w-20 h-20 text-[#f25c41]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#272163]">
                  Sign up and get invites to upcoming dinners
                </h3>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-transparent rounded-full mb-6 border-4 border-[#272163] p-4">
                  <Utensils className="w-20 h-20 text-[#f25c41]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#272163]">
                  Share a meal at local spots with fellow members
                </h3>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-transparent rounded-full mb-6 border-4 border-[#272163] p-4">
                  <Users className="w-20 h-20 text-[#f25c41]" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#272163]">
                  Make connections and enjoy great company
                </h3>
              </div>
            </div>
          </div>
        </section>
        
        <FeaturedEvents />
        
        {/* Testimonials Section */}
        <section className="section-padding bg-teal-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">What People Are Saying</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Hear from restaurant owners and attendees who have used Eat Meet Club.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://randomuser.me/api/portraits/women/45.jpg" 
                    alt="Restaurant Owner" 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-medium">Sarah Johnson</h4>
                    <p className="text-sm text-gray-500">Owner, Urban Bistro</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Eat Meet Club has transformed our slow Tuesday nights into one of our busiest evenings! 
                  The platform is easy to use and we've built a loyal community of regulars through our monthly chef's table events."
                </p>
                <div className="mt-4 flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="Event Attendee" 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-medium">Michael Chen</h4>
                    <p className="text-sm text-gray-500">Regular Attendee</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "As someone new to the city, Eat Meet Club has been amazing for discovering local restaurants and meeting people. 
                  The breakfast networking events are perfect for professionals, and I've made both business connections and friends!"
                </p>
                <div className="mt-4 flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="bg-brand-500 py-16">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Join the Community?</h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-8">
              Whether you're a restaurant owner looking to host events or a food enthusiast seeking unique dining experiences, 
              Eat Meet Club is the perfect platform to connect.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button href="/signup" variant="primary" size="lg" className="bg-white text-brand-500 hover:bg-gray-100">
                Sign Up Now
              </Button>
              <Button href="/events" variant="outline" size="lg" className="border-white text-white hover:bg-brand-600">
                Browse Events
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Index;
