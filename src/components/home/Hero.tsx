
import { Button } from "@/components/common/Button";

const Hero = () => {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-12 md:py-24">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[#272163] mb-3">
            Link Up Over Food <span className="text-[#272163]">&</span> Conversation
          </h1>
          
          <p className="text-[#f25c41] text-xl md:text-2xl mb-8 max-w-2xl">
            Join us for fun group dinners where strangers become friends.
          </p>
          
          <Button 
            href="/signup" 
            size="lg" 
            className="bg-[#f25c41] text-white hover:bg-[#e04e35] px-10 py-4 text-xl rounded-full"
          >
            BECOME A MEMBER
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
