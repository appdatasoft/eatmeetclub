
import React from "react";

const HowItWorks = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-10 text-[#007c89]">HOW IT WORKS</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 - Closed Envelope Icon */}
          <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="mb-6 transform transition-transform duration-300 group-hover:scale-105">
              <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                <circle cx="70" cy="70" r="70" fill="#9FD7D9" fillOpacity="0.6"/>
                {/* Envelope body */}
                <rect x="40" y="45" width="60" height="45" rx="2" fill="#FF5F50" stroke="#272163" strokeWidth="4"/>
                {/* Envelope closed flap */}
                <path d="M40 45L70 65L100 45" stroke="#272163" strokeWidth="4" fill="#FF5F50" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#272163]">
              Sign up and get invites to upcoming dinners
            </h3>
            <p className="text-gray-600">
              Create your profile and receive personalized invitations to dining events in your area.
            </p>
          </div>
          
          {/* Step 2 - Plate with fork and knife on sides */}
          <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="mb-6 transform transition-transform duration-300 group-hover:scale-105">
              <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                <circle cx="70" cy="70" r="70" fill="#9FD7D9" fillOpacity="0.6"/>
                {/* Plate - outer circle */}
                <circle cx="70" cy="70" r="30" fill="#FF5F50" stroke="#272163" strokeWidth="4"/>
                {/* Plate - inner circle */}
                <circle cx="70" cy="70" r="22" fill="white" stroke="#272163" strokeWidth="2"/>
                {/* Fork on the left */}
                <path d="M30 45V95" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                <path d="M30 45L35 45" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                <path d="M30 52L35 52" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                <path d="M30 59L35 59" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                {/* Knife on the right */}
                <path d="M110 45V95" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                <path d="M110 45L105 65" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#272163]">
              Share a meal at local spots with fellow members
            </h3>
            <p className="text-gray-600">
              Enjoy curated dining experiences at partner restaurants with like-minded food enthusiasts.
            </p>
          </div>
          
          {/* Step 3 - Smiling face icon */}
          <div className="flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="mb-6 transform transition-transform duration-300 group-hover:scale-105">
              <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                <circle cx="70" cy="70" r="70" fill="#9FD7D9" fillOpacity="0.6"/>
                {/* Face circle */}
                <circle cx="70" cy="70" r="30" fill="#feb372" stroke="#272163" strokeWidth="4"/>
                {/* Hair */}
                <path d="M50 50C50 50 55 40 70 40C85 40 90 50 90 50" fill="#9FD7D9" stroke="#272163" strokeWidth="4"/>
                {/* Eyes - curved happy eyes */}
                <path d="M57 60C57 60 60 65 63 60" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                <path d="M77 60C77 60 80 65 83 60" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
                {/* Smile */}
                <path d="M60 80C60 80 65 85 80 80" stroke="#272163" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#272163]">
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
            className="inline-block bg-[#ff5f50] text-[#272163] hover:bg-[#ff4c3d] px-10 py-4 text-xl rounded-full transition-colors duration-300 font-bold"
          >
            BECOME A MEMBER
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
