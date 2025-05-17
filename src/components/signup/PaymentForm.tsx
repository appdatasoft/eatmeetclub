import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CreditCard, User, Mail, Phone, MapPin } from "lucide-react";
import { SignupFormValues } from "./SignupForm";

const paymentFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  userDetails: SignupFormValues;
  membershipFee: number;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isSubscription?: boolean;
  requireAllFields?: boolean;
}

const PaymentForm = ({
  userDetails,
  membershipFee,
  onBack,
  onSubmit,
  isLoading,
  isSubscription = false,
  requireAllFields = false
}: PaymentFormProps) => {
  // Create a full name from firstName and lastName
  const fullName = userDetails.firstName && userDetails.lastName 
    ? `${userDetails.firstName} ${userDetails.lastName}`
    : "";

  const [formData, setFormData] = useState({
    name: fullName,
    email: userDetails.email || "",
    phone: userDetails.phoneNumber || "",
    address: userDetails.address || "",
  });

  const validationSchema = requireAllFields 
    ? paymentFormSchema.extend({
        phone: z.string().min(1, { message: "Phone number is required" }),
        address: z.string().min(1, { message: "Address is required" }),
      })
    : paymentFormSchema;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: fullName,
      email: userDetails.email || "",
      phone: userDetails.phoneNumber || "",
      address: userDetails.address || "",
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Update the hidden form fields used for submission
    const element = document.getElementById(field) as HTMLInputElement;
    if (element) {
      element.value = value;
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Hidden fields to store the actual values for submission */}
          <input type="hidden" id="name" name="name" value={formData.name} />
          <input type="hidden" id="email" name="email" value={formData.email} />
          <input type="hidden" id="phone" name="phone" value={formData.phone} />
          <input type="hidden" id="address" name="address" value={formData.address} />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <Input 
                      placeholder="Enter your full name" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("name", e.target.value);
                      }} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("email", e.target.value);
                      }} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number {requireAllFields && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <Input 
                      placeholder="Enter your phone number" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("phone", e.target.value);
                      }} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address {requireAllFields && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <Input 
                      placeholder="Enter your address" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("address", e.target.value);
                      }} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card className="bg-gray-50 border border-gray-200">
            <CardContent className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Monthly Membership</p>
                  {isSubscription && <p className="text-xs text-gray-500">Billed monthly</p>}
                </div>
                <p className="font-semibold">${membershipFee}.00</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <p className="font-medium">Total</p>
                <p className="font-bold text-lg">${membershipFee}.00</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !form.formState.isValid}
              className="flex items-center"
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Complete Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PaymentForm;
