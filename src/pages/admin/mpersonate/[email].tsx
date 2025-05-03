// src/pages/admin/impersonate/[email].tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ImpersonationView = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedEmail = urlParams.get("email");
    if (preselectedEmail) setSearch(preselectedEmail);
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user || !user.email.endsWith("@eatmeetclub.com")) {
        navigate("/login");
        return;
      }
    };

    const fetchUserBilling = async () => {
      if (!email) return navigate("/admin");

      const { data, error } = await supabase
        .from("billing_history")
        .select("*")
        .eq("email", email)
        .order("paid_at", { ascending: false });

      if (error) {
        console.error("Failed to load billing history:", error);
        return;
      }

      setRecords(data);
      setLoading(false);
    };

    checkAdmin();
    fetchUserBilling();
  }, [email, navigate]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Impersonating: {email}</h1>
      <button
        onClick={() => navigate(`/admin?from=impersonation&email=${encodeURIComponent(email || '')}`)}
        className="mb-4 px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
      >
        ← Back to Admin Dashboard
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Amount</th>
              <th className="border p-2">Paid At</th>
              <th className="border p-2">Expires At</th>
              <th className="border p-2">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="border p-2">${r.amount.toFixed(2)}</td>
                <td className="border p-2">{new Date(r.paid_at).toLocaleDateString()}</td>
                <td className="border p-2">{new Date(r.expires_at).toLocaleDateString()}</td>
                <td className="border p-2">
                  <a href={r.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View
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

export default ImpersonationView;
