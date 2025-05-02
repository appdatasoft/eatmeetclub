
import { Button } from "@/components/common/Button";
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const { user } = useAuth();
  
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
        <Button asChild size="lg" variant="secondary">
          <Link to="/membership-payment" className="font-semibold">
            Join Membership Now
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
