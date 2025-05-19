
import EditableText from "@/components/editor/EditableText";
import EditableImage from "@/components/editor/EditableImage";
import { useEditableContent } from "@/components/editor/EditableContentProvider";

const HowItWorks = () => {
  const { editModeEnabled } = useEditableContent();

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
            <div className="mb-6 relative w-48 h-48">
              <EditableImage
                id="step-1-image"
                size="custom"
                shape="circle"
                className="w-48 h-48 bg-brand-100"
                alt="Step 1"
                defaultImage=""
              />
              {!editModeEnabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-brand-500 text-3xl font-bold">1</span>
                </div>
              )}
            </div>
            <EditableText
              id="step-1-title"
              tag="h3"
              className="text-xl font-semibold mb-3"
              defaultContent="Buy Ticket"
            />
            <EditableText
              id="step-1-content"
              tag="p"
              className="text-gray-600"
              defaultContent="Purchase your ticket to upcoming food & game events. Each ticket includes access to the venue, delicious food, and exciting games."
            />
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 relative w-48 h-48">
              <EditableImage
                id="step-2-image"
                size="custom"
                shape="circle"
                className="w-48 h-48 bg-brand-100"
                alt="Step 2"
                defaultImage=""
              />
              {!editModeEnabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-brand-500 text-3xl font-bold">2</span>
                </div>
              )}
            </div>
            <EditableText
              id="step-2-title"
              tag="h3"
              className="text-xl font-semibold mb-3"
              defaultContent="Play Game"
            />
            <EditableText
              id="step-2-content"
              tag="p"
              className="text-gray-600"
              defaultContent="Enjoy an evening of food and interactive gameplay. Experience various games while connecting with like-minded people in a relaxed atmosphere."
            />
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 relative w-48 h-48">
              <EditableImage
                id="step-3-image"
                size="custom"
                shape="circle"
                className="w-48 h-48 bg-brand-100"
                alt="Step 3"
                defaultImage=""
              />
              {!editModeEnabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-brand-500 text-3xl font-bold">3</span>
                </div>
              )}
            </div>
            <EditableText
              id="step-3-title"
              tag="h3"
              className="text-xl font-semibold mb-3"
              defaultContent="Build Local Community"
            />
            <EditableText
              id="step-3-content"
              tag="p"
              className="text-gray-600"
              defaultContent="Create lasting connections in your neighborhood. Turn strangers into friends and establish a vibrant local community centered around shared interests."
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
