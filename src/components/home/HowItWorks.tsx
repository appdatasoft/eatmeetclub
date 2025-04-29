
import React from "react";

const HowItWorks = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-10 text-[#0d7b8a]">HOW IT WORKS</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 - Envelope Icon */}
          <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="mb-6 transform transition-transform duration-300 group-hover:scale-105">
              <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                <circle cx="70" cy="70" r="70" fill="#9FD7D9" fillOpacity="0.6"/>
                {/* Envelope */}
                <rect x="35" y="45" width="70" height="50" rx="3" fill="#FF5F50" stroke="#272163" strokeWidth="4"/>
                {/* Envelope flap lines */}
                <path d="M35 55L70 75L105 55" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#0d7b8a]">
              Sign up and get invites to upcoming dinners
            </h3>
            <p className="text-gray-600">
              Create your profile and receive personalized invitations to dining events in your area.
            </p>
          </div>
          
          {/* Step 2 - Plate with utensils */}
          <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="mb-6 transform transition-transform duration-300 group-hover:scale-105">
              <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                <circle cx="70" cy="70" r="70" fill="#9FD7D9" fillOpacity="0.6"/>
                {/* Plate */}
                <circle cx="70" cy="70" r="35" fill="#FF5F50" stroke="#272163" strokeWidth="4"/>
                {/* Fork on the left */}
                <path d="M50 45V95" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                <path d="M46 50H54" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                <path d="M46 55H54" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                <path d="M46 60H54" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                {/* Knife on the right */}
                <path d="M90 45V95" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                <path d="M90 45L85 50" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                <path d="M90 55L85 60" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                <path d="M90 65L85 70" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#0d7b8a]">
              Share a meal at local spots with fellow members
            </h3>
            <p className="text-gray-600">
              Enjoy curated dining experiences at partner restaurants with like-minded food enthusiasts.
            </p>
          </div>
          
          {/* Step 3 - Happy face icon */}
          <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="mb-6 transform transition-transform duration-300 group-hover:scale-105">
              <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                <circle cx="70" cy="70" r="70" fill="#9FD7D9" fillOpacity="0.6"/>
                {/* Face circle */}
                <circle cx="70" cy="70" r="35" fill="#FF5F50" stroke="#272163" strokeWidth="4"/>
                {/* Hair */}
                <path d="M70 40C60 40 55 45 55 45C55 45 60 35 70 35C80 35 85 45 85 45C85 45 80 40 70 40Z" fill="#9FD7D9" stroke="#272163" strokeWidth="3"/>
                {/* Eyes - smiling */}
                <path d="M57 62C59 60 61 60 63 62" stroke="#272163" strokeWidth="3" strokeLinecap="round"/>
                <path d="M77 62C79 60 81 60 83 62" stroke="#272163" strokeWidth="3" strokeLinecap="round"/>
                {/* Smile */}
                <path d="M55 75C55 75 60 85 70 85C80 85 85 75 85 75" stroke="#272163" strokeWidth="3" strokeLinecap="round"/>
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
            className="inline-block bg-[#f25c41] text-white hover:bg-[#e04e35] px-10 py-4 text-lg rounded-full transition-colors duration-300 font-semibold"
          >
            JOIN NOW
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
