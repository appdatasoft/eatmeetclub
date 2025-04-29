
import { Mail, Utensils, Users } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-10 text-[#0d7b8a]">HOW IT WORKS</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 bg-[#0d7b8a]">
              <Mail className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#0d7b8a]">
              Sign up and get invites to upcoming dinners
            </h3>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 bg-[#0d7b8a]">
              <Utensils className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#0d7b8a]">
              Share a meal at local spots with fellow members
            </h3>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 bg-[#0d7b8a]">
              <Users className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#0d7b8a]">
              Make connections and enjoy great company
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
