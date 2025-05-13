
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
        // Using RPC to call a database function instead of directly querying a table
        const { data, error } = await supabase.rpc('get_billing_history', {
          p_email: isAdmin ? null : userEmail
        });
        
        if (error) {
          console.error("Failed to fetch billing records:", error);
        } else {
          setRecords(data as BillingRecord[] || []);
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
