
import React from "react";
import EditableText from "@/components/editor/EditableText";

const AboutTabContent = () => {
  return (
    <div className="space-y-12">
      <section className="mb-12">
        <EditableText
          id="mission-heading"
          tag="h2"
          className="text-2xl font-semibold mb-4"
          defaultContent="Our Mission"
        />
        <EditableText
          id="mission-paragraph-1"
          tag="p"
          className="text-lg mb-4"
          defaultContent="Eat Meet Club is on a mission to transform restaurants into vibrant community gathering spaces. 
          We believe that food has the power to bring people together, and our platform helps create 
          meaningful connections through shared dining experiences."
        />
        <EditableText
          id="mission-paragraph-2"
          tag="p"
          className="text-lg"
          defaultContent="By connecting food lovers with local restaurants hosting community dining events, 
          we're building a world where no one eats alone and restaurants thrive as social hubs."
        />
      </section>
      
      <section className="mb-12">
        <EditableText
          id="how-it-works-heading"
          tag="h2"
          className="text-2xl font-semibold mb-4"
          defaultContent="How It Works"
        />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <EditableText
              id="diners-heading"
              tag="div"
              className="text-brand-500 font-bold text-xl mb-2"
              defaultContent="For Diners"
            />
            <EditableText
              id="diners-content"
              tag="p"
              defaultContent="Browse and join community dining events at local restaurants. Meet new people who share your 
              interest in food and community."
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <EditableText
              id="restaurants-heading"
              tag="div"
              className="text-brand-500 font-bold text-xl mb-2"
              defaultContent="For Restaurants"
            />
            <EditableText
              id="restaurants-content"
              tag="p"
              defaultContent="Host community dining events during off-peak hours to fill empty seats and create loyal customers 
              who see your establishment as more than just a place to eat."
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <EditableText
              id="communities-heading"
              tag="div"
              className="text-brand-500 font-bold text-xl mb-2"
              defaultContent="For Communities"
            />
            <EditableText
              id="communities-content"
              tag="p"
              defaultContent="Foster stronger local connections as neighbors meet over meals, supporting local businesses 
              while building meaningful relationships."
            />
          </div>
        </div>
      </section>
      
      <section className="mb-12">
        <EditableText
          id="our-story-heading"
          tag="h2"
          className="text-2xl font-semibold mb-4"
          defaultContent="Our Story"
        />
        <EditableText
          id="story-paragraph-1"
          tag="p"
          className="text-lg mb-4"
          defaultContent="Eat Meet Club was founded in 2024 by a group of food enthusiasts who noticed two problems: 
          people were increasingly eating alone, and restaurants were struggling with empty tables during off-peak hours."
        />
        <EditableText
          id="story-paragraph-2"
          tag="p"
          className="text-lg mb-4"
          defaultContent="The idea was simple but powerful: create a platform that helps restaurants host community dining events 
          where strangers can come together to enjoy a meal, conversation, and connection."
        />
        <EditableText
          id="story-paragraph-3"
          tag="p"
          className="text-lg"
          defaultContent="Since our launch, we've facilitated thousands of connections over meals, helping both diners find community 
          and restaurants thrive as social spaces."
        />
      </section>
      
      <section>
        <EditableText
          id="join-heading"
          tag="h2"
          className="text-2xl font-semibold mb-4"
          defaultContent="Join Our Community"
        />
        <EditableText
          id="join-paragraph"
          tag="p"
          className="text-lg mb-6"
          defaultContent="Whether you're looking to meet new people, find a dining companion, or simply enjoy a meal in good company, 
          Eat Meet Club has a seat for you at the table."
        />
        <div className="flex justify-center">
          <a href="/signup" className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Sign Up Today
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutTabContent;
