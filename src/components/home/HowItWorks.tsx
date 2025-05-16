
import EditableText from "@/components/editor/EditableText";

const HowItWorks = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-10">
          <EditableText
            id="how-it-works-title"
            tag="h2"
            className="text-3xl font-bold mb-4"
            defaultContent="How It Works"
          />
          <EditableText
            id="how-it-works-subtitle"
            tag="p"
            className="text-gray-600 max-w-2xl mx-auto"
            defaultContent="See how easy it is to connect with others over delicious food and fun games."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <span className="text-brand-500 text-2xl font-bold">1</span>
            </div>
            <EditableText
              id="step-1-title"
              tag="h3"
              className="text-xl font-semibold mb-3"
              defaultContent="Find a Game Night"
            />
            <EditableText
              id="step-1-content"
              tag="p"
              className="text-gray-600"
              defaultContent="Discover food & game events by location, cuisine type, or game preferences. See who's coming and what's on the menu."
            />
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <span className="text-brand-500 text-2xl font-bold">2</span>
            </div>
            <EditableText
              id="step-2-title"
              tag="h3"
              className="text-xl font-semibold mb-3"
              defaultContent="Join the Table"
            />
            <EditableText
              id="step-2-content"
              tag="p"
              className="text-gray-600"
              defaultContent="Reserve your spot with a simple booking. Your seat includes food, games, and a chance to meet new friends with similar interests."
            />
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-brand-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <span className="text-brand-500 text-2xl font-bold">3</span>
            </div>
            <EditableText
              id="step-3-title"
              tag="h3"
              className="text-xl font-semibold mb-3"
              defaultContent="Play & Connect"
            />
            <EditableText
              id="step-3-content"
              tag="p"
              className="text-gray-600"
              defaultContent="Enjoy delicious food, play engaging games, and forge meaningful connections that continue long after the last move is made."
            />
          </div>
        </div>
        
        <div className="text-center mt-12">
          <EditableText
            id="cta-text"
            tag="p"
            className="mb-6 text-lg"
            defaultContent="Ready to link up over food & games?"
          />
          <a 
            href="/events" 
            className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-md transition-colors inline-block"
          >
            Browse Events
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
