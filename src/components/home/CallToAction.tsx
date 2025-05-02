
import { Button } from "@/components/common/Button";
import { useNavigate } from 'react-router-dom';

const CallToAction = () => {
  const navigate = useNavigate();
  
  const handleJoinClick = () => {
    navigate('/become-member');
  };
  
  return (
    <section className="py-16 bg-gradient-to-r from-brand-500 to-brand-600 text-white">
      <div className="container-custom text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to join our food adventure?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Become a member today and start connecting with fellow food enthusiasts
          at unique dining experiences.
        </p>
        <Button 
          onClick={handleJoinClick} 
          size="lg" 
          variant="secondary"
          className="font-semibold"
        >
          Join Membership Now
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
