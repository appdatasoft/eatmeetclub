
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import EditableText from "@/components/editor/EditableText";
import AboutTabs from "@/components/about/AboutTabs";

const About = () => {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <MainLayout>
      <div className="container-custom py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <EditableText
            id="about-title"
            tag="h1" 
            className="text-4xl font-bold mb-8 text-center"
            defaultContent="About Eat Meet Club"
          />
          
          <div className="bg-white rounded-xl p-8 shadow-sm mb-12">
            <EditableText
              id="about-summary"
              tag="p"
              className="text-lg text-gray-700 leading-relaxed"
              defaultContent="Eat Meet Club brings people together through shared dining experiences at local restaurants. We create spaces for meaningful connections, support neighborhood businesses, and build stronger communities around the dinner table. Join us to make new friends, discover great food, and rediscover the joy of face-to-face conversations."
            />
          </div>
          
          <AboutTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
