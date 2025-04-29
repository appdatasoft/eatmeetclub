
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const RestaurantJoin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Registration submitted",
        description: "We'll review your application and get back to you soon.",
        duration: 5000,
      });
      navigate('/');
    }, 1500);
  };

  return (
    <>
      <Navbar />
      <main className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-4">Join as a Restaurant Partner</h1>
              <p className="text-gray-600">
                Start hosting unique dining events and build a community around your restaurant.
              </p>
            </div>
            
            {/* Registration Form */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Restaurant Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Restaurant Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurantName">Restaurant Name*</Label>
                      <Input id="restaurantName" required placeholder="Your restaurant name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website URL</Label>
                      <Input id="website" type="url" placeholder="https://your-restaurant.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="restaurantAddress">Address*</Label>
                    <Input id="restaurantAddress" required placeholder="Full restaurant address" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City*</Label>
                      <Input id="city" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province*</Label>
                      <Input id="state" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipcode">Zip/Postal Code*</Label>
                      <Input id="zipcode" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cuisineType">Cuisine Type*</Label>
                    <Input id="cuisineType" required placeholder="e.g., Italian, Japanese, etc." />
                  </div>
                </div>
                
                {/* Contact Person */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h2 className="text-xl font-semibold">Contact Person</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name*</Label>
                      <Input id="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name*</Label>
                      <Input id="lastName" required />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address*</Label>
                      <Input id="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number*</Label>
                      <Input id="phone" type="tel" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position at Restaurant*</Label>
                    <Input id="position" required placeholder="e.g., Owner, Manager, etc." />
                  </div>
                </div>
                
                {/* Terms and Conditions */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mt-1 mr-2"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the <a href="/terms" className="text-brand-500 hover:underline">Terms and Conditions</a> and understand 
                      there is a $50 fee per event published on Eat Meet Club.
                    </label>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="pt-4">
                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    Register Restaurant
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-4">
                    We'll review your application and contact you within 2-3 business days.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RestaurantJoin;
