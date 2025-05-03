
// src/pages/admin/BillingDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BillingDashboard = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
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

  useEffect(() => {
    const fetchBillingHistory = async () => {
      const query = supabase.from("billing_history").select("*").order("paid_at", { ascending: false });
      const { data, error } = isAdmin
        ? await query
        : await query.eq("email", userEmail);

      if (error) console.error("Failed to fetch billing records:", error);
      else setRecords(data);
      setLoading(false);
    };

    if (userEmail) fetchBillingHistory();
  }, [userEmail, isAdmin]);

  const filtered = records.filter((r) => {
    const matchEmail = r.email.toLowerCase().includes(search.toLowerCase());
    const matchMonth = filterMonth
      ? new Date(r.paid_at).toISOString().slice(0, 7) === filterMonth
      : true;
    return matchEmail && matchMonth;
  });

  const totalRevenue = filtered.reduce((sum, r) => sum + r.amount, 0);

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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Billing History</h1>
      {isAdmin && (
        <div className="mb-4 px-4 py-2 bg-yellow-100 text-yellow-800 text-sm rounded">
          <strong>Admin Mode:</strong> Viewing all user billing records
        </div>
      )}

      {userEmail && (
        <>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => setSearch(e.target.value)}
                className="border px-3 py-2 rounded text-sm"
              >
                <option value="">All users</option>
                {[...new Set(records.map((r) => r.email))].map((email) => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
              <button
                onClick={() => navigate(`/admin/impersonate/${search}`)}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
              >
                Impersonate
              </button>
            </div>
          )}
          <div className="flex items-center justify-between mb-4 gap-4">
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded w-64"
            />
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <button
              onClick={exportCSV}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Export CSV
            </button>
          </div>
        </>
      )}

      <div className="mb-4 text-sm text-gray-700">
        Showing {filtered.length} records — Total Revenue: <strong>${totalRevenue.toFixed(2)}</strong>
      </div>

      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Paid At</th>
              <th className="border p-2">Expires At</th>
              <th className="border p-2">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="border p-2">{r.email}</td>
                <td className="border p-2">${r.amount.toFixed(2)}</td>
                <td className="border p-2">{new Date(r.paid_at).toLocaleDateString()}</td>
                <td className="border p-2">{new Date(r.expires_at).toLocaleDateString()}</td>
                <td className="border p-2">
                  <a
                    href={r.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Receipt
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BillingDashboard;
