
import React from "react";

const HowItWorks = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-10 text-[#0d7b8a]">HOW IT WORKS</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="mb-6 transform transition-transform duration-300 group-hover:scale-105">
              <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                <circle cx="70" cy="70" r="70" fill="#0d7b8a" fillOpacity="0.2"/>
                <rect x="32" y="35" width="76" height="70" rx="4" fill="#FF5F50" stroke="#272163" strokeWidth="4"/>
                <path d="M32 45L70 65L108 45" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#0d7b8a]">
              Sign up and get invites to upcoming dinners
            </h3>
            <p className="text-gray-600">
              Create your profile and receive personalized invitations to dining events in your area.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="mb-6 transform transition-transform duration-300 group-hover:scale-105">
              <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                <circle cx="70" cy="70" r="70" fill="#0d7b8a" fillOpacity="0.2"/>
                <circle cx="70" cy="70" r="40" fill="#FF5F50" stroke="#272163" strokeWidth="4"/>
                <line x1="35" y1="70" x2="105" y2="70" stroke="#272163" strokeWidth="4"/>
                <line x1="70" y1="35" x2="70" y2="105" stroke="#272163" strokeWidth="4"/>
                <path d="M105 70 A35 35 0 0 1 70 35" stroke="#272163" strokeWidth="4"/>
                <path d="M35 70 A35 35 0 0 1 70 105" stroke="#272163" strokeWidth="4"/>
                <line x1="40" y1="40" x2="55" y2="55" stroke="#272163" strokeWidth="4"/>
                <line x1="85" y1="85" x2="100" y2="100" stroke="#272163" strokeWidth="4"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#0d7b8a]">
              Share a meal at local spots with fellow members
            </h3>
            <p className="text-gray-600">
              Enjoy curated dining experiences at partner restaurants with like-minded food enthusiasts.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="mb-6 transform transition-transform duration-300 group-hover:scale-105">
              <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                <circle cx="70" cy="70" r="70" fill="#0d7b8a" fillOpacity="0.2"/>
                <circle cx="70" cy="60" r="38" fill="#FF5F50" stroke="#272163" strokeWidth="4"/>
                <circle cx="55" cy="55" r="6" fill="#272163"/>
                <circle cx="85" cy="55" r="6" fill="#272163"/>
                <path d="M50 75 Q70 90 90 75" stroke="#272163" strokeWidth="4" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#0d7b8a]">
              Make connections and enjoy great company
            </h3>
            <p className="text-gray-600">
              Build your network, create meaningful relationships, and discover new favorite restaurants.
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <a 
            href="/signup" 
            className="inline-block bg-[#f25c41] text-white hover:bg-[#e04e35] px-8 py-3 text-lg rounded-full transition-colors duration-300 font-semibold"
          >
            JOIN NOW
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
