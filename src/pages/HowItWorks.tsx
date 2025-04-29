
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const HowItWorks = () => {
  return (
    <>
      <Navbar />
      <div className="container-custom py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">How It Works</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Connecting Food Lovers with Community Dining</h2>
            <p className="text-lg mb-6">
              Eat Meet Club bridges the gap between restaurants looking to fill empty seats and people seeking social dining experiences. 
              Our platform makes it easy to discover, join, and host community dining events.
            </p>
          </section>
          
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-8 text-center">For Restaurants</h2>
            
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-brand-100 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 md:mt-0">
                  <span className="text-brand-500 text-2xl font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Create Your Restaurant Profile</h3>
                  <p className="text-gray-700">
                    Sign up as a restaurant and complete your profile with details about your establishment, 
                    cuisine type, location, and photos. Verification is quick and ensures only legitimate 
                    restaurants can host events.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-brand-100 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 md:mt-0">
                  <span className="text-brand-500 text-2xl font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Design Community Dining Events</h3>
                  <p className="text-gray-700">
                    Create unique dining events during your slower hours. Set the number of seats, 
                    price per person, menu, and any special details about the experience. Our platform 
                    charges a modest $50 listing fee per event, with no additional commissions.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-brand-100 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 md:mt-0">
                  <span className="text-brand-500 text-2xl font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Host and Build Community</h3>
                  <p className="text-gray-700">
                    Welcome attendees to your restaurant and facilitate connections. Our host guidelines 
                    help you create an atmosphere where diners feel comfortable and engaged. After the event, 
                    collect feedback to improve future gatherings.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-8 text-center">For Diners</h2>
            
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-teal-100 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 md:mt-0">
                  <span className="text-teal-500 text-2xl font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Discover Events</h3>
                  <p className="text-gray-700">
                    Browse community dining events by location, cuisine type, date, or price point. 
                    Each listing includes details about the restaurant, the menu, and what to expect 
                    from the experience.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-teal-100 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 md:mt-0">
                  <span className="text-teal-500 text-2xl font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Reserve Your Seat</h3>
                  <p className="text-gray-700">
                    Purchase tickets to events that interest you through our secure payment system. 
                    Receive a digital ticket and any pre-event information from the restaurant. 
                    Set your dining preferences and any dietary restrictions.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-teal-100 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 md:mt-0">
                  <span className="text-teal-500 text-2xl font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Attend and Connect</h3>
                  <p className="text-gray-700">
                    Arrive at the restaurant, meet fellow diners, and enjoy a curated dining experience. 
                    Our community guidelines encourage meaningful conversation and connection. 
                    After the event, you can leave reviews and connect with new friends.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Platform Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium text-lg mb-3">For Restaurants</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Fill empty seats during off-peak hours</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Build a loyal community of regulars</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Increase word-of-mouth marketing</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No commission fees, just a flat listing fee</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium text-lg mb-3">For Diners</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Discover new restaurants and cuisines</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Meet new people with shared interests</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Enjoy curated dining experiences</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Never dine alone unless you want to</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          
          <div className="text-center mt-12">
            <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <a href="/signup" className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-block">
                Sign Up Now
              </a>
              <a href="/events" className="bg-white border border-brand-500 text-brand-500 hover:bg-brand-50 font-bold py-3 px-6 rounded-lg transition-colors inline-block">
                Browse Events
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HowItWorks;
