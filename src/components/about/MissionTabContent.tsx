
import React from "react";

const MissionTabContent = () => {
  return (
    <div className="space-y-10">
      <section className="bg-white p-8 rounded-xl shadow-sm">
        <div className="flex items-start gap-6">
          <div className="text-3xl">🍽️</div>
          <div>
            <h2 className="text-2xl font-serif text-brand-500 mb-3">
              Connecting People to People
            </h2>
            <p className="text-gray-700">
              We create spaces for real conversations, not scrolling. Our events are designed to foster genuine 
              human connection in a world increasingly dominated by digital interactions.
            </p>
          </div>
        </div>
      </section>
      
      <section className="bg-white p-8 rounded-xl shadow-sm">
        <div className="flex items-start gap-6">
          <div className="text-3xl">🌱</div>
          <div>
            <h2 className="text-2xl font-serif text-brand-500 mb-3">
              Supporting Local Restaurants
            </h2>
            <p className="text-gray-700">
              Local restaurants are the heart of every neighborhood. We partner with these establishments to 
              help them thrive while creating memorable community experiences for everyone.
            </p>
          </div>
        </div>
      </section>
      
      <section className="bg-white p-8 rounded-xl shadow-sm">
        <div className="flex items-start gap-6">
          <div className="text-3xl">💬</div>
          <div>
            <h2 className="text-2xl font-serif text-brand-500 mb-3">
              Reconnecting Citizens to Civic Purpose
            </h2>
            <p className="text-gray-700">
              We're making local government feel human again by creating spaces where neighbors can discuss 
              local issues over good food. When communities gather, positive change happens naturally.
            </p>
          </div>
        </div>
      </section>
      
      <section className="bg-white p-8 rounded-xl shadow-sm">
        <div>
          <h2 className="text-2xl font-serif text-brand-500 mb-3">
            Pushing Back Against Isolation
          </h2>
          <p className="text-gray-700">
            In a world of endless consumerism and mindless entertainment, we're creating something different. 
            EatMeetClub stands against the forces that distract, isolate, and extract value from our communities.
          </p>
        </div>
      </section>

      <div className="text-center pt-6">
        <a 
          href="/become-member" 
          className="inline-block bg-brand-500 text-white px-6 py-3 rounded-lg hover:bg-brand-600 transition-colors"
        >
          Join Our Movement
        </a>
      </div>
    </div>
  );
};

export default MissionTabContent;
