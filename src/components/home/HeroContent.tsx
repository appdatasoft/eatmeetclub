
import { Button } from "@/components/common/Button";
import { useNavigate } from "react-router-dom";
import EditableText from "@/components/editor/EditableText";
import { useEditableContent } from "@/components/editor/EditableContentProvider";

const HeroContent = () => {
  const navigate = useNavigate();
  const { contentMap } = useEditableContent();

  // Simplified navigation handler without async/await
  const handleJoinClick = () => {
    navigate('/become-member');
  };

  return (
    <div className="flex flex-col items-center text-center w-full">
      <EditableText
        id="hero-title"
        tag="h1"
        className="text-3xl md:text-5xl font-bold text-white mb-3"
        defaultContent="Link Up Over Food & Conversation"
      />
      
      <EditableText
        id="hero-description"
        tag="p"
        className="text-white text-xl md:text-2xl mb-8 max-w-3xl"
        defaultContent="Join us for fun social dining where strangers become friends — while helping local businesses and building vibrant local communities."
      />
      
      <EditableText
        id="hero-button"
        tag="span"
        className="hidden"
        defaultContent="BECOME A MEMBER"
      >
        <Button 
          onClick={handleJoinClick}
          size="lg" 
          className="bg-[#FEC6A1] text-[#703E1E] hover:bg-[#FDE1D3] px-10 py-4 text-xl font-bold rounded-full"
        >
          {contentMap["hero-button"]?.content || "BECOME A MEMBER"}
        </Button>
      </EditableText>
    </div>
  );
};

export default HeroContent;
