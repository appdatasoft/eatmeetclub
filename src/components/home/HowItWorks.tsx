
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
            defaultContent="See how easy it is to find community dining events or host your own as a restaurant."
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
              defaultContent="Find an Event"
            />
            <EditableText
              id="step-1-content"
              tag="p"
              className="text-gray-600"
              defaultContent="Browse dining events by location, cuisine, or date. Each event shows details about the restaurant and other attendees."
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
              defaultContent="Reserve Your Spot"
            />
            <EditableText
              id="step-2-content"
              tag="p"
              className="text-gray-600"
              defaultContent="Book your seat with a simple payment process. Each reservation includes your meal and the opportunity to meet new people."
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
              defaultContent="Enjoy the Experience"
            />
            <EditableText
              id="step-3-content"
              tag="p"
              className="text-gray-600"
              defaultContent="Arrive at the restaurant, meet fellow diners, enjoy great food, and make connections that last beyond the meal."
            />
          </div>
        </div>
        
        <div className="text-center mt-12">
          <EditableText
            id="cta-text"
            tag="p"
            className="mb-6 text-lg"
            defaultContent="Ready to join a community dining event?"
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
