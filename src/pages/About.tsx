
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
          
          <AboutTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
