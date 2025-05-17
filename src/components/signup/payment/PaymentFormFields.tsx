
import { User, Mail, Phone, MapPin } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./types";

interface PaymentFormFieldsProps {
  form: UseFormReturn<PaymentFormValues>;
  handleInputChange: (field: string, value: string) => void;
  requireAllFields?: boolean;
}

const PaymentFormFields = ({ 
  form,
  handleInputChange,
  requireAllFields = false 
}: PaymentFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                <Input 
                  placeholder="Enter your first name" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("firstName", e.target.value);
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
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                <Input 
                  placeholder="Enter your last name" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("lastName", e.target.value);
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
    </>
  );
};

export default PaymentFormFields;
