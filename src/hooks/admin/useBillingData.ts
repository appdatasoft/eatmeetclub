
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BillingRecord {
  id: string;
  email: string;
  amount: number;
  paid_at: string;
  expires_at: string;
  receipt_url: string;
}

export const useBillingData = (userEmail: string | null, isAdmin: boolean) => {
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    const fetchBillingHistory = async () => {
      if (!userEmail) return;
      
      try {
        // Use direct query instead of RPC since the function isn't defined in types
        let query = supabase
          .from('membership_payments')
          .select(`
            id,
            amount,
            payment_id,
            memberships!inner (
              id,
              user_id,
              started_at,
              renewal_at,
              status
            ),
            auth.users!inner (
              email
            )
          `);
        
        // If not admin, filter to only user's records
        if (!isAdmin) {
          query = query.eq('memberships.user_id', userEmail);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Failed to fetch billing records:", error);
        } else {
          // Transform the data into the BillingRecord format
          const formattedRecords: BillingRecord[] = (data || []).map((record: any) => ({
            id: record.id,
            email: record.users?.email || "unknown",
            amount: record.amount,
            paid_at: record.memberships?.started_at || "",
            expires_at: record.memberships?.renewal_at || "",
            receipt_url: record.payment_id ? `https://dashboard.stripe.com/payments/${record.payment_id}` : ""
          }));
          
          setRecords(formattedRecords);
        }
      } catch (err) {
        console.error("Error in billing data fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingHistory();
  }, [userEmail, isAdmin]);

  const filtered = records.filter((r) => {
    const matchEmail = r.email.toLowerCase().includes(search.toLowerCase());
    const matchMonth = filterMonth
      ? new Date(r.paid_at).toISOString().slice(0, 7) === filterMonth
      : true;
    return matchEmail && matchMonth;
  });

  const totalRevenue = filtered.reduce((sum, r) => sum + r.amount, 0);

  const revenueByMonth = records.reduce((acc, record) => {
    const month = new Date(record.paid_at).toISOString().slice(0, 7);
    if (!acc[month]) acc[month] = 0;
    acc[month] += record.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(revenueByMonth).map(([month, total]) => ({
    month,
    total
  }));

  return {
    records,
    filtered,
    loading,
    search,
    setSearch,
    filterMonth,
    setFilterMonth,
    totalRevenue,
    chartData
  };
};
