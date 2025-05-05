
import { useState } from "react";
import { useForm } from "react-hook-form";

const AdminCreateProduct = () => {
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    setResult(null);

    try {
      const priceCents = Math.round(parseFloat(values.price) * 100);

      const res = await fetch("https://wocfwpedauuhlrfugxuu.supabase.co/functions/v1/create-stripe-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          price_cents: priceCents,
          interval: "month",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(`✅ Created product with Stripe price ID: ${data.price_id}`);
        reset();
      } else {
        setResult(`❌ Error: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setResult(`❌ Exception: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Membership Product</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            {...register("name", { required: true })}
            className="w-full border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <input
            type="text"
            {...register("description")}
            className="w-full border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Price (USD / month)</label>
          <input
            type="number"
            step="0.01"
            {...register("price", { required: true })}
            className="w-full border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isLoading ? "Creating..." : "Create Product"}
        </button>

        {result && (
          <p className="mt-4 text-sm">{result}</p>
        )}
      </form>
    </div>
  );
};

export default AdminCreateProduct;
