
import { Button } from "@/components/common/Button";

const Hero = () => {
  return (
    <div 
      className="bg-gray-300 py-12 md:py-24 relative h-[500px] w-full"
      style={{ 
        backgroundImage: `url('/lovable-uploads/2db24df8-eae3-4bee-9783-534552ad2fa2.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <div className="container-custom relative z-10 h-full flex items-center">
        <div className="flex flex-col items-center text-center w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Link Up Over Food <span className="text-white">&</span> Conversation
          </h1>
          
          <p className="text-white text-xl md:text-2xl mb-8 max-w-2xl">
            Join us for fun social dining where strangers become friends.
          </p>
          
          <Button 
            href="/become-member" 
            size="lg" 
            className="bg-[#FEC6A1] text-[#703E1E] hover:bg-[#FDE1D3] px-10 py-4 text-xl font-bold rounded-full"
          >
            BECOME A MEMBER
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
