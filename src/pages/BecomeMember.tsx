
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MembershipPageContent from "@/components/membership/MembershipPageContent";
import MembershipCheckoutFlow from "@/components/membership/MembershipCheckoutFlow";
import { useMembershipSubmission } from "@/hooks/membership/useMembershipSubmission";

const BecomeMember = () => {
  const { isLoading, isSubmitted, handleMembershipSubmit, setIsSubmitted } = useMembershipSubmission();
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <MembershipCheckoutFlow isSubmitted={isSubmitted} setIsSubmitted={setIsSubmitted} />
        <MembershipPageContent onSubmit={handleMembershipSubmit} isLoading={isLoading} />
      </div>
      <Footer />
    </>
  );
};

export default BecomeMember;
