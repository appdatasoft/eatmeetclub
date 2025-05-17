
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EditableText from "@/components/editor/EditableText";
import { useState } from "react";
import { TabsLarge, TabsListLarge, TabsTriggerLarge, TabsContentLarge } from "@/components/ui/tabs";
import { Book, Target, Eye } from "lucide-react";

const About = () => {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <>
      <Navbar />
      <div className="container-custom py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <EditableText
            id="about-title"
            tag="h1" 
            className="text-4xl font-bold mb-8 text-center"
            defaultContent="About Eat Meet Club"
          />
          
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
            </TabsContentLarge>
            
            <TabsContentLarge value="vision">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h2 className="text-2xl font-serif text-brand-500 mb-4">
                  🌍 EatMeetClub Vision
                </h2>
                <p className="text-gray-700 mb-6 text-xl italic">
                  To rebuild local community from the dinner table out — by uniting neighbors through food, games, and civic purpose.
                </p>
                <p className="text-gray-600 mb-6">
                  EatMeetClub is where people disconnect from distractions and reconnect with each other, their neighborhoods, and their voice in shaping the place they live. It's a movement to restore real connection, support local restaurants, and make civic life feel human, playful, and meaningful again.
                </p>
                <p className="text-gray-600">
                  This vision stands against isolation, consumer manipulation, and digital numbness.
                  And it stands for joy, belonging, and rootedness.
                </p>
              </div>
              
              <div className="text-center pt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Join Our Community</h3>
                <p className="text-gray-600 mb-6">
                  Be part of the movement to rebuild local communities through shared meals and meaningful connections.
                </p>
                <a 
                  href="/events" 
                  className="inline-block bg-brand-500 text-white px-6 py-3 rounded-lg hover:bg-brand-600 transition-colors"
                >
                  Browse Events
                </a>
              </div>
            </TabsContentLarge>
            
            <TabsContentLarge value="mission">
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
              </div>
              
              <div className="text-center pt-6">
                <a 
                  href="/become-member" 
                  className="inline-block bg-brand-500 text-white px-6 py-3 rounded-lg hover:bg-brand-600 transition-colors"
                >
                  Join Our Movement
                </a>
              </div>
            </TabsContentLarge>
          </TabsLarge>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
