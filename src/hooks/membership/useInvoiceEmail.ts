
/**
 * Replaces Supabase DB query with call to Edge Function: check-membership-status
 */
export const useInvoiceEmail = () => {
  const checkActiveMembership = async (email: string): Promise<{
    active: boolean;
    remainingDays: number;
    proratedAmount: number;
  }> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-membership-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
          },
          body: JSON.stringify({ email })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check membership status");
      }

      return await response.json();
    } catch (error) {
      console.error("checkActiveMembership error:", error);
      return {
        active: false,
        remainingDays: 0,
        proratedAmount: 25.0
      };
    }
  };

  return {
    checkActiveMembership
  };
};
