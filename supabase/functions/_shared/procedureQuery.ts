
// Helper function to run the procedure SQL on the function
export const runProcedureQuery = async (supabase, query) => {
  try {
    const { data, error } = await supabase.rpc('run_sql', { 
      query_text: query 
    });
    
    if (error) {
      console.error("SQL Procedure error:", error);
      return { error };
    }
    
    return { data };
  } catch (err) {
    console.error("Procedure execution error:", err);
    return { error: err };
  }
};

// Create the insert_membership_payment procedure if it doesn't exist
export const ensureMembershipPaymentProcedure = async (supabase) => {
  const query = `
  CREATE OR REPLACE FUNCTION public.insert_membership_payment(
    p_membership_id uuid,
    p_amount numeric,
    p_payment_id text,
    p_payment_status text DEFAULT 'succeeded'
  ) RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE
    v_payment_id uuid;
  BEGIN
    INSERT INTO public.membership_payments(
      membership_id,
      amount,
      payment_id,
      payment_status
    ) VALUES (
      p_membership_id,
      p_amount,
      p_payment_id,
      p_payment_status
    )
    RETURNING id INTO v_payment_id;
    
    RETURN v_payment_id;
  END;
  $$;
  `;
  
  return await runProcedureQuery(supabase, query);
};
