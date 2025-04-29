
import { Button } from "@/components/common/Button";

const Hero = () => {
  return (
    <div 
      className="bg-cover bg-center py-12 md:py-24 relative"
      style={{ 
        backgroundImage: "url('/lovable-uploads/8892bda2-4cdb-4489-8ee3-a3d41c72eb09.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* Dark overlay for better text readability - removed since the image already has good contrast */}
      
      <div className="container-custom relative z-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[#FFF3E0] mb-3">
            More Than a Restaurant —<br />Become a Gathering Place
          </h1>
          
          <p className="text-[#FFF3E0] text-xl md:text-2xl mb-8 max-w-2xl">
            Join us for fun social dining where strangers become friends.
          </p>
          
          <Button 
            href="/signup" 
            size="lg" 
            className="bg-[#FFF3E0] text-[#a04b20] hover:bg-[#e6dac7] px-10 py-4 text-xl rounded-full font-medium"
          >
            BECOME A MEMBER
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
