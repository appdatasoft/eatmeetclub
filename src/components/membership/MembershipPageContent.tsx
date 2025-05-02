
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import MembershipSteps from "@/components/membership/MembershipSteps";
import StripeModeNotification from "@/components/membership/StripeModeNotification";
import { useStripeMode } from "@/hooks/membership/useStripeMode";

interface MembershipPageContentProps {
  onSubmit: (values: any) => Promise<void>;
  isLoading: boolean;
}

const MembershipPageContent: React.FC<MembershipPageContentProps> = ({ onSubmit, isLoading }) => {
  // Use our hook for Stripe mode checking
  const { isStripeTestMode, stripeCheckError, handleRetryStripeCheck } = useStripeMode();

  return (
    <div className="container-custom">
      {/* Display improved Stripe mode notification */}
      <StripeModeNotification 
        isStripeTestMode={isStripeTestMode}
        stripeCheckError={stripeCheckError}
        onRetry={handleRetryStripeCheck}
      />
      
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="bg-brand-500 text-white">
            <CardTitle className="text-2xl">Join Our Membership</CardTitle>
            <CardDescription className="text-white/90">
              Connect with fellow food enthusiasts at unique dining experiences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <MembershipSteps 
              onSubmit={onSubmit}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MembershipPageContent;
