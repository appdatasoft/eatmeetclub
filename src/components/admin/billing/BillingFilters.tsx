
import { useNavigate } from "react-router-dom";

interface BillingFiltersProps {
  isAdmin: boolean;
  records: Array<{ email: string; }>;
  search: string;
  setSearch: (value: string) => void;
  filterMonth: string;
  setFilterMonth: (value: string) => void;
  exportCSV: () => void;
}

const BillingFilters = ({ 
  isAdmin, 
  records, 
  search, 
  setSearch, 
  filterMonth, 
  setFilterMonth,
  exportCSV 
}: BillingFiltersProps) => {
  const navigate = useNavigate();

  return (
    <>
      {isAdmin && (
        <div className="flex items-center gap-2 mb-4">
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
  );
};

export default BillingFilters;
