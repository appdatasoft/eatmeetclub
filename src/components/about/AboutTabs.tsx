
import React from "react";
import { TabsLarge, TabsListLarge, TabsTriggerLarge, TabsContentLarge } from "@/components/ui/tabs";
import { Book, Target, Eye } from "lucide-react";
import AboutTabContent from "./AboutTabContent";
import VisionTabContent from "./VisionTabContent";
import MissionTabContent from "./MissionTabContent";

interface AboutTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AboutTabs: React.FC<AboutTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <TabsLarge value={activeTab} onValueChange={setActiveTab} className="mt-8">
      <TabsListLarge>
        <TabsTriggerLarge value="about">
          <Book className="h-5 w-5" />
          <span>About</span>
        </TabsTriggerLarge>
        <TabsTriggerLarge value="vision">
          <Eye className="h-5 w-5" />
          <span>Vision</span>
        </TabsTriggerLarge>
        <TabsTriggerLarge value="mission">
          <Target className="h-5 w-5" />
          <span>Mission</span>
        </TabsTriggerLarge>
      </TabsListLarge>
      
      <TabsContentLarge value="about" className="space-y-12">
        <AboutTabContent />
      </TabsContentLarge>
      
      <TabsContentLarge value="vision">
        <VisionTabContent />
      </TabsContentLarge>
      
      <TabsContentLarge value="mission">
        <MissionTabContent />
      </TabsContentLarge>
    </TabsLarge>
  );
};

export default AboutTabs;
