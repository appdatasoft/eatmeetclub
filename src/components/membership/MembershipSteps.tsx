
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CreditCard, User, Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const membershipFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type MembershipFormValues = z.infer<typeof membershipFormSchema>;

interface MembershipStepsProps {
  onSubmit: (values: MembershipFormValues) => Promise<void>;
  isLoading: boolean;
}

const MembershipSteps = ({ onSubmit, isLoading }: MembershipStepsProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      name: localStorage.getItem('signup_name') || "",
      email: localStorage.getItem('signup_email') || "",
      phone: localStorage.getItem('signup_phone') || "",
      address: localStorage.getItem('signup_address') || "",
    },
  });

  const handleStepSubmit = form.handleSubmit(async (values) => {
    if (step === 1) {
      // Store values and proceed to next step
      localStorage.setItem('signup_name', values.name);
      localStorage.setItem('signup_email', values.email);
      
      toast({
        title: "Information saved",
        description: "Please complete your membership details",
      });
      
      setStep(2);
    } else {
      // Store additional values and complete submission
      localStorage.setItem('signup_phone', values.phone || "");
      localStorage.setItem('signup_address', values.address || "");
      
      try {
        await onSubmit(values);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  });

  return (
    <div className="p-6">
      {/* Step indicators */}
      <div className="flex mb-8 justify-center">
        <div className="flex items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 1 ? 'bg-brand-500 text-white' : 'bg-brand-100 text-brand-500'}`}>1</div>
          <div className="h-1 w-10 bg-gray-200"></div>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 2 ? 'bg-brand-500 text-white' : 'bg-brand-100 text-brand-500'}`}>2</div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleStepSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <Input placeholder="Enter your full name" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full mt-6"
                disabled={!form.formState.isValid || form.formState.isSubmitting}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Contact Details</h2>
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        <Input placeholder="Enter your phone number" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        <Input placeholder="Enter your address" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex mt-6 space-x-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isLoading || !form.formState.isValid}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <span>Complete Payment</span>
                      <CreditCard className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  );
};

export default MembershipSteps;
