
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import { Button } from "@/components/common/Button";

const Index = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedEvents />
        
        {/* How It Works Section */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Eat Meet Club connects restaurants with food enthusiasts looking for unique dining experiences.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* For Restaurants */}
              <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">For Restaurants</h3>
                <ul className="text-left space-y-4 mb-6">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-brand-500 text-white rounded-full mr-2 flex-shrink-0 text-xs">1</span>
                    <span>Create a business profile and verify your restaurant</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-brand-500 text-white rounded-full mr-2 flex-shrink-0 text-xs">2</span>
                    <span>Create and publish unique dining events ($50 per event)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-brand-500 text-white rounded-full mr-2 flex-shrink-0 text-xs">3</span>
                    <span>Host events and build a loyal community of diners</span>
                  </li>
                </ul>
                <Button href="/restaurants/join" variant="primary">Register Restaurant</Button>
              </div>
              
              {/* For Attendees */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">For Attendees</h3>
                <ul className="text-left space-y-4 mb-6">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-teal-500 text-white rounded-full mr-2 flex-shrink-0 text-xs">1</span>
                    <span>Browse events by category, date, or location</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-teal-500 text-white rounded-full mr-2 flex-shrink-0 text-xs">2</span>
                    <span>Purchase tickets to events that interest you</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-teal-500 text-white rounded-full mr-2 flex-shrink-0 text-xs">3</span>
                    <span>Attend events, enjoy great food, and meet new people</span>
                  </li>
                </ul>
                <Button href="/events" variant="secondary">Find Events</Button>
              </div>
              
              {/* Features */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Platform Features</h3>
                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Easy event discovery and filtering</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Secure payment processing</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Digital ticket management</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Restaurant analytics dashboard</span>
                  </li>
                </ul>
                <Button href="/about" variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        
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
