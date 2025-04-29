
import { Button } from "@/components/common/Button";

const CallToAction = () => {
  return (
    <section className="bg-brand-500 py-16">
      <div className="container-custom text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Join the Community?</h2>
        <p className="text-white/90 max-w-2xl mx-auto mb-8">
          Whether you're a restaurant owner looking to host events or a food enthusiast seeking unique dining experiences, 
          Eat Meet Club is the perfect platform to connect.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button href="/become-member" variant="primary" size="lg" className="bg-white text-brand-500 hover:bg-gray-100">
            Become a Member
          </Button>
          <Button href="/events" variant="outline" size="lg" className="border-white text-white hover:bg-brand-600">
            Browse Events
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
