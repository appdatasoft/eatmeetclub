
import { Button } from "@/components/common/Button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  // Simplified navigation handler without async/await
  const handleJoinClick = () => {
    navigate('/become-member');
  };

  return (
    <div 
      className="w-full py-12 md:py-24 relative h-[500px] bg-[#B5642A]"
      style={{ 
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      <div className="container-custom relative z-10 h-full flex items-center">
        <div className="flex flex-col items-center text-center w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Link Up Over Food <span className="text-white">&</span> Conversation
          </h1>
          
          <p className="text-white text-xl md:text-2xl mb-8 max-w-3xl">
            Join us for fun social dining where strangers become friends — while helping local businesses and building vibrant local communities.
          </p>
          
          <Button 
            onClick={handleJoinClick}
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
