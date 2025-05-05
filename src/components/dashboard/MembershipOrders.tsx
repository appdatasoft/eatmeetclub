
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Receipt, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";

interface Payment {
  id: string;
  amount: number;
  created_at: string;
  payment_id: string;
  payment_method: string | null;
  product_name: string | null;
  receipt_url: string | null;
}

export function MembershipOrders() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      try {
        // Query that joins membership_payments with memberships
        const { data, error } = await supabase
          .from('membership_payments')
          .select(`
            id,
            amount,
            created_at,
            payment_id,
            payment_method,
            payment_status,
            memberships!inner (
              user_id,
              product_id
            )
          `)
          .eq('memberships.user_id', user.id)
          .eq('payment_status', 'succeeded')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform data and set up payments array
        const transformedPayments = data.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          created_at: payment.created_at,
          payment_id: payment.payment_id,
          payment_method: payment.payment_method,
          product_name: 'Membership', // Default name
          receipt_url: null // Will attempt to fetch this separately
        }));
        
        setPayments(transformedPayments);
        
        // For payments that have a product_id, fetch the product name
        for (const [index, payment] of data.entries()) {
          if (payment.memberships?.product_id) {
            try {
              const { data: productData } = await supabase
                .from('products')
                .select('name')
                .eq('stripe_product_id', payment.memberships.product_id)
                .maybeSingle();
                
              if (productData?.name) {
                setPayments(prev => 
                  prev.map((p, i) => 
                    i === index ? { ...p, product_name: productData.name } : p
                  )
                );
              }
            } catch (productError) {
              console.error("Error fetching product:", productError);
              // Continue without product name
            }
          }
        }
        
        // For each payment with a payment_id, try to get a receipt URL
        for (const payment of transformedPayments) {
          if (payment.payment_id) {
            try {
              const { data: receiptData } = await supabase.functions.invoke('get-invoice-receipt', {
                body: { sessionId: payment.payment_id }
              });
              
              if (receiptData?.receiptUrl) {
                setPayments(prev => 
                  prev.map(p => 
                    p.id === payment.id 
                      ? { ...p, receipt_url: receiptData.receiptUrl } 
                      : p
                  )
                );
              }
            } catch (receiptError) {
              console.error("Error fetching receipt:", receiptError);
              // Continue without receipt URL
            }
          }
        }
      } catch (err) {
        console.error("Error fetching payment history:", err);
        setError("Failed to load payment history");
        toast({
          title: "Error",
          description: "Failed to load your payment history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchPayments();
    }
  }, [user?.id, toast]);

  const handleViewReceipt = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: "Receipt Unavailable",
        description: "The receipt for this payment is not available",
        variant: "default",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Membership Payment History</CardTitle>
        <CardDescription>View your past membership payments and receipts</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No payment records found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div 
                key={payment.id} 
                className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{payment.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(payment.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">${payment.amount.toFixed(2)}</span>
                  <button
                    onClick={() => handleViewReceipt(payment.receipt_url)}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                    title="View Receipt"
                  >
                    <Receipt className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MembershipOrders;
