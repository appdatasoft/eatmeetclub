
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface BillingRecord {
  id: string;
  email: string;
  amount: number;
  paid_at: string;
  expires_at: string;
  receipt_url: string;
}

interface BillingTableProps {
  records: BillingRecord[];
  loading: boolean;
}

const BillingTable = ({ records, loading }: BillingTableProps) => {
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Table className="min-w-full border text-sm">
      <TableHeader>
        <TableRow className="bg-gray-100">
          <TableHead className="border p-2 text-left">Email</TableHead>
          <TableHead className="border p-2">Amount</TableHead>
          <TableHead className="border p-2">Paid At</TableHead>
          <TableHead className="border p-2">Expires At</TableHead>
          <TableHead className="border p-2">Receipt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id} className="border-t">
            <TableCell className="border p-2">{record.email}</TableCell>
            <TableCell className="border p-2">${record.amount.toFixed(2)}</TableCell>
            <TableCell className="border p-2">{new Date(record.paid_at).toLocaleDateString()}</TableCell>
            <TableCell className="border p-2">{new Date(record.expires_at).toLocaleDateString()}</TableCell>
            <TableCell className="border p-2">
              <a
                href={record.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Receipt
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BillingTable;
