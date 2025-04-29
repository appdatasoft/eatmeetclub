
import { Button } from "@/components/common/Button";

const Hero = () => {
  return (
    <div 
      className="bg-cover bg-center py-12 md:py-24 relative"
      style={{ 
        backgroundImage: "url('/lovable-uploads/4a4e6ff6-7ba6-4158-84d0-229c31e29ab0.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <div className="container-custom relative z-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[#FFF3E0] mb-3">
            Link Up Over Food <span className="text-[#FFF3E0]">&</span> Conversation
          </h1>
          
          <p className="text-[#FFF3E0] text-xl md:text-2xl mb-8 max-w-2xl">
            Join us for fun social dining where strangers become friends.
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
