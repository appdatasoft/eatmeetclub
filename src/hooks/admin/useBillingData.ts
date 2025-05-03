
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
      
      const query = supabase.from("billing_history").select("*").order("paid_at", { ascending: false });
      const { data, error } = isAdmin
        ? await query
        : await query.eq("email", userEmail);

      if (error) console.error("Failed to fetch billing records:", error);
      else setRecords(data || []);
      setLoading(false);
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
