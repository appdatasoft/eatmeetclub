
// MembershipSteps.tsx (partial)
import { useMembershipSubmission } from "@/hooks/membership/useMembershipSubmission";

const MembershipSteps = () => {
  const { submitMembership } = useMembershipSubmission();

  const handleComplete = () => {
    submitMembership({
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: false,
      checkExisting: true
    });
  };

  return (
    <button onClick={handleComplete}>
      Complete Membership
    </button>
  );
};

export default MembershipSteps;
