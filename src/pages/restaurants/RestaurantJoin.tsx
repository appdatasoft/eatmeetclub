import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const RestaurantJoin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Restaurant Info
    restaurantName: '',
    website: '',
    restaurantAddress: '',
    city: '',
    state: '',
    zipcode: '',
    cuisineType: '',
    
    // Contact Person
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    
    // Business Details
    einNumber: '',
    businessLicenseNumber: '',
    
    // Terms
    termsAccepted: false
  });
  
  const updateFormField = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check for existing user
      const { data: existingUsers, error: userError } = await supabase
        .from('profiles') // Changed from auth.users to profiles
        .select('id, user_id')
        .eq('email', formData.email)
        .limit(1);
        
      let userId;
      
      // Create user if doesn't exist
      if (!existingUsers || existingUsers.length === 0) {
        // Generate a random password for the new user
        const tempPassword = Math.random().toString(36).slice(-8);
        
        // Create the user
        const { data: userData, error: createError } = await supabase.auth.signUp({
          email: formData.email,
          password: tempPassword,
          options: {
            data: {
              full_name: `${formData.firstName} ${formData.lastName}`
            }
          }
        });
        
        if (createError) throw createError;
        userId = userData.user?.id;
        
        // Send a password reset email to the user
        await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/set-password`
        });
      } else {
        userId = existingUsers[0].user_id || existingUsers[0].id;
      }
      
      // Register the restaurant
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([
          {
            name: formData.restaurantName,
            cuisine_type: formData.cuisineType,
            address: formData.restaurantAddress,
            city: formData.city,
            state: formData.state,
            zipcode: formData.zipcode,
            website: formData.website || null,
            phone: formData.phone,
            user_id: userId,
            owner_name: `${formData.firstName} ${formData.lastName}`,
            owner_email: formData.email,
            ein_number: formData.einNumber,
            business_license_number: formData.businessLicenseNumber,
            verification_status: 'pending'
          }
        ])
        .select()
        .single();
      
      if (restaurantError) throw restaurantError;
      
      toast({
        title: "Registration successful!",
        description: "Welcome aboard! We've sent you an email with login instructions.",
      });
      
      // Redirect to a welcome page or login page
      navigate('/login', { 
        state: { 
          message: "Registration successful! Please check your email for login instructions." 
        } 
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const nextStep = () => {
    if (currentStep === 1) {
      // Validate restaurant information
      if (!formData.restaurantName || !formData.restaurantAddress || !formData.city || 
          !formData.state || !formData.zipcode || !formData.cuisineType) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields for your restaurant.",
          variant: "destructive"
        });
        return;
      }
    } else if (currentStep === 2) {
      // Validate contact information
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.position) {
        toast({
          title: "Missing information",
          description: "Please fill in all required contact information fields.",
          variant: "destructive"
        });
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
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
            
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
                  <div className="step-circle">1</div>
                  <div className="step-text">Restaurant Info</div>
                </div>
                <div className={`step-connector ${currentStep >= 2 ? 'active' : ''}`}></div>
                <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
                  <div className="step-circle">2</div>
                  <div className="step-text">Contact Person</div>
                </div>
                <div className={`step-connector ${currentStep >= 3 ? 'active' : ''}`}></div>
                <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-circle">3</div>
                  <div className="step-text">Business Details</div>
                </div>
              </div>
            </div>
            
            {/* Registration Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentStep === 1 ? 'Restaurant Information' : 
                   currentStep === 2 ? 'Contact Person' : 
                   'Business Details'}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 ? 'Tell us about your restaurant' : 
                   currentStep === 2 ? 'Who should we contact about your restaurant?' : 
                   'Provide your business verification details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Restaurant Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="restaurantName">Restaurant Name*</Label>
                          <Input 
                            id="restaurantName" 
                            required 
                            placeholder="Your restaurant name" 
                            value={formData.restaurantName}
                            onChange={(e) => updateFormField('restaurantName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website URL</Label>
                          <Input 
                            id="website" 
                            type="url" 
                            placeholder="https://your-restaurant.com" 
                            value={formData.website}
                            onChange={(e) => updateFormField('website', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="restaurantAddress">Address*</Label>
                        <Input 
                          id="restaurantAddress" 
                          required 
                          placeholder="Full restaurant address" 
                          value={formData.restaurantAddress}
                          onChange={(e) => updateFormField('restaurantAddress', e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City*</Label>
                          <Input 
                            id="city" 
                            required 
                            value={formData.city}
                            onChange={(e) => updateFormField('city', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province*</Label>
                          <Input 
                            id="state" 
                            required 
                            value={formData.state}
                            onChange={(e) => updateFormField('state', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipcode">Zip/Postal Code*</Label>
                          <Input 
                            id="zipcode" 
                            required 
                            value={formData.zipcode}
                            onChange={(e) => updateFormField('zipcode', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cuisineType">Cuisine Type*</Label>
                        <Input 
                          id="cuisineType" 
                          required 
                          placeholder="e.g., Italian, Japanese, etc." 
                          value={formData.cuisineType}
                          onChange={(e) => updateFormField('cuisineType', e.target.value)}
                        />
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <Button onClick={nextStep} type="button">
                          Next Step
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Contact Person */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name*</Label>
                          <Input 
                            id="firstName" 
                            required 
                            value={formData.firstName}
                            onChange={(e) => updateFormField('firstName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name*</Label>
                          <Input 
                            id="lastName" 
                            required 
                            value={formData.lastName}
                            onChange={(e) => updateFormField('lastName', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address*</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            required 
                            value={formData.email}
                            onChange={(e) => updateFormField('email', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number*</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            required 
                            value={formData.phone}
                            onChange={(e) => updateFormField('phone', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="position">Position at Restaurant*</Label>
                        <Input 
                          id="position" 
                          required 
                          placeholder="e.g., Owner, Manager, etc." 
                          value={formData.position}
                          onChange={(e) => updateFormField('position', e.target.value)}
                        />
                      </div>
                      
                      <div className="pt-4 flex justify-between">
                        <Button onClick={prevStep} type="button" variant="outline">
                          Previous
                        </Button>
                        <Button onClick={nextStep} type="button">
                          Next Step
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3: Business Details */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="einNumber">EIN Number*</Label>
                            <Input 
                              id="einNumber" 
                              required 
                              placeholder="XX-XXXXXXX" 
                              value={formData.einNumber}
                              onChange={(e) => updateFormField('einNumber', e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                              Your business Employer Identification Number
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="businessLicenseNumber">Business License Number*</Label>
                            <Input 
                              id="businessLicenseNumber" 
                              required 
                              placeholder="Your business license number" 
                              value={formData.businessLicenseNumber}
                              onChange={(e) => updateFormField('businessLicenseNumber', e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                              Your state or local business license number
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                          <h4 className="font-medium text-amber-800 mb-2">
                            Additional Verification Required
                          </h4>
                          <p className="text-sm text-amber-700">
                            After registration, you'll need to upload copies of your driver's license and business license
                            to complete the verification process. This is required to process payments and approve events.
                          </p>
                        </div>
                      
                        {/* Terms and Conditions */}
                        <div className="pt-4">
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              id="terms"
                              required
                              className="mt-1 mr-2"
                              checked={formData.termsAccepted}
                              onChange={(e) => updateFormField('termsAccepted', e.target.checked)}
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                              I agree to the <a href="/terms" className="text-brand-500 hover:underline">Terms and Conditions</a> and understand 
                              there is a $50 fee per event published on Eat Meet Club.
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <Button onClick={prevStep} type="button" variant="outline">
                          Previous
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                          Complete Registration
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              We'll review your application and contact you within 2-3 business days.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      
      <style jsx>{`
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
        }
        
        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .step-text {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }
        
        .step-connector {
          height: 2px;
          flex: 1;
          background-color: #e5e7eb;
          margin: 0 8px;
          position: relative;
          top: -24px;
        }
        
        .step-item.active .step-circle {
          background-color: #2563eb;
          color: white;
        }
        
        .step-item.active .step-text {
          color: #2563eb;
          font-weight: 600;
        }
        
        .step-connector.active {
          background-color: #2563eb;
        }
      `}</style>
    </>
  );
};

export default RestaurantJoin;
