
// src/components/membership/MembershipSteps.tsx
import { useMembershipSubmission } from "@/hooks/membership/useMembershipSubmission";
import { Button } from "@/components/ui/button";

const MembershipSteps = () => {
  const { submitMembership } = useMembershipSubmission();

  const handleComplete = () => {
    submitMembership({
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: false, // Change to true if you want to email invoices
      checkExisting: true
    });
  };

  return (
    <div className="flex justify-center mt-10">
      <Button onClick={handleComplete}>Complete Membership</Button>
    </div>
  );
};

export default MembershipSteps;


// src/hooks/membership/useMembershipSubmission.ts
export type MembershipSubmissionOptions = {
  createUser: boolean;
  sendPasswordEmail: boolean;
  sendInvoiceEmail: boolean;
  checkExisting: boolean;
};

export const useMembershipSubmission = () => {
  const submitMembership = async ({
    createUser,
    sendPasswordEmail,
    sendInvoiceEmail,
    checkExisting
  }: MembershipSubmissionOptions) => {
    try {
      console.log("Submitting membership with options:", {
        createUser,
        sendPasswordEmail,
        sendInvoiceEmail,
        checkExisting
      });

      // Your logic here to handle each step
      // Example: check Supabase user, create user, Stripe checkout, etc.

    } catch (error) {
      console.error("Membership submission error:", error);
    }
  };

  return {
    submitMembership
  };
};
pFormValues = z.infer<typeof membershipFormSchema>;

interface MembershipStepsProps {
  onSubmit: (values: MembershipFormValues) => Promise<void>;
  isLoading: boolean;
}

const MembershipSteps = ({ onSubmit, isLoading }: MembershipStepsProps) => {
  const { toast } = useToast();
  const [isProcessingVerification, setIsProcessingVerification] = useState(false);
  const { isVerifying, verifyEmailAndMembershipStatus, handleExistingMember } = useMembershipVerification();
  const { createCheckoutSession } = useCheckoutSession();
  
  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      name: localStorage.getItem('signup_name') || "",
      email: localStorage.getItem('signup_email') || "",
      phone: localStorage.getItem('signup_phone') || "",
      address: localStorage.getItem('signup_address') || "",
    },
  });

  const handleFormSubmit = form.handleSubmit(async (values) => {
    try {
      // Store all values in localStorage
      localStorage.setItem('signup_name', values.name);
      localStorage.setItem('signup_email', values.email);
      localStorage.setItem('signup_phone', values.phone);
      localStorage.setItem('signup_address', values.address);
      
      setIsProcessingVerification(true);
      
      // Step 1: Check if user exists and has membership
      const { userExists, hasActiveMembership } = await verifyEmailAndMembershipStatus(values.email);
      
      // If user exists and has active membership, redirect to login
      if (userExists && hasActiveMembership) {
        handleExistingMember(values.email);
        return;
      }
      
      // Step 2: Process to payment (create checkout session)
      try {
        const checkoutResult = await createCheckoutSession(
          values.email,
          values.name,
          values.phone,
          values.address,
          {
            createUser: !userExists, // Only create user if they don't exist
            sendPasswordEmail: !userExists, // Only send password email for new users
            sendInvoiceEmail: true, // Added missing parameter
            checkExisting: true, // Added missing parameter
          }
        );
        
        // Redirect to Stripe checkout
        if (checkoutResult.success && checkoutResult.url) {
          window.location.href = checkoutResult.url;
        } else {
          throw new Error("Failed to create checkout session");
        }
      } catch (checkoutError) {
        console.error("Checkout error:", checkoutError);
        toast({
          title: "Payment Error",
          description: "There was a problem setting up the payment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingVerification(false);
    }
  });

  return (
    <div className="p-6">
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Membership Information</h2>
          
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

          <Button 
            type="submit" 
            className="w-full mt-6"
            disabled={isLoading || isVerifying || isProcessingVerification || !form.formState.isValid}
          >
            {isLoading || isVerifying || isProcessingVerification ? (
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
        </form>
      </Form>
    </div>
  );
};

export default MembershipSteps;
