
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
            <div className="inline-flex items-center justify-center w-32 h-32 bg-transparent rounded-full mb-6 border-4 border-[#272163] p-4">
              <Mail className="w-20 h-20 text-[#f25c41]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#272163]">
              Sign up and get invites to upcoming dinners
            </h3>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-transparent rounded-full mb-6 border-4 border-[#272163] p-4">
              <Utensils className="w-20 h-20 text-[#f25c41]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#272163]">
              Share a meal at local spots with fellow members
            </h3>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-transparent rounded-full mb-6 border-4 border-[#272163] p-4">
              <Users className="w-20 h-20 text-[#f25c41]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#272163]">
              Make connections and enjoy great company
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
