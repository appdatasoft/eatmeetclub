
// src/pages/admin/BillingDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { useBillingData } from "@/hooks/admin/useBillingData";
import BillingChart from "@/components/admin/billing/BillingChart";
import BillingFilters from "@/components/admin/billing/BillingFilters";
import BillingTable from "@/components/admin/billing/BillingTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BillingDashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        navigate("/login");
        return;
      }
      setUserEmail(user.email);
      setIsAdmin(user.email.endsWith("@eatmeetclub.com"));
    };

    checkAuth();
  }, [navigate]);

  const { 
    filtered, 
    loading, 
    search, 
    setSearch, 
    filterMonth, 
    setFilterMonth,
    totalRevenue,
    chartData,
    records
  } = useBillingData(userEmail, isAdmin);

  const exportCSV = () => {
    const header = ["Email", "Amount", "Paid At", "Expires At", "Receipt URL"];
    const rows = filtered.map(r => [
      r.email,
      r.amount,
      new Date(r.paid_at).toLocaleDateString(),
      new Date(r.expires_at).toLocaleDateString(),
      r.receipt_url
    ]);
    const csvContent = [header, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "billing_history.csv");
    link.click();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Billing History</h1>
      
      {isAdmin && (
        <div className="mb-4 px-4 py-2 bg-yellow-100 text-yellow-800 text-sm rounded">
          <strong>Admin Mode:</strong> Viewing all user billing records
        </div>
      )}

      {userEmail && (
        <BillingFilters
          isAdmin={isAdmin}
          records={records}
          search={search}
          setSearch={setSearch}
          filterMonth={filterMonth}
          setFilterMonth={setFilterMonth}
          exportCSV={exportCSV}
        />
      )}

      <div className="mb-4 text-sm text-gray-700">
        Showing {filtered.length} records — Total Revenue: <strong>${totalRevenue.toFixed(2)}</strong>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Revenue by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <BillingChart chartData={chartData} />
        </CardContent>
      </Card>

      <BillingTable records={filtered} loading={loading} />
    </div>
  );
};

export default BillingDashboard;
