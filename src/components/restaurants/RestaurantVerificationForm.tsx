
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Upload, FileText, BadgeCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Restaurant } from "@/components/restaurants/types/restaurant";

// Form schema for restaurant verification
const verificationSchema = z.object({
  ein_number: z.string().min(1, "EIN number is required"),
  business_license_number: z.string().min(1, "Business license number is required"),
  owner_name: z.string().min(1, "Owner name is required"),
  owner_ssn_last4: z.string()
    .min(4, "Last 4 digits of SSN required")
    .max(4, "Only the last 4 digits of SSN")
    .regex(/^\d{4}$/, "Must be 4 digits"),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

interface RestaurantVerificationFormProps {
  restaurant: Restaurant;
  onVerificationComplete?: () => void;
}

const RestaurantVerificationForm: React.FC<RestaurantVerificationFormProps> = ({ 
  restaurant,
  onVerificationComplete
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [driversLicenseFile, setDriversLicenseFile] = useState<File | null>(null);
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    driversLicense: number;
    businessLicense: number;
  }>({
    driversLicense: 0,
    businessLicense: 0
  });

  // Initialize the form with existing data if available
  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      ein_number: restaurant?.ein_number || "",
      business_license_number: restaurant?.business_license_number || "",
      owner_name: restaurant?.owner_name || "",
      owner_ssn_last4: restaurant?.owner_ssn_last4 || "",
    },
  });
  
  // Update form when restaurant data changes
  useEffect(() => {
    if (restaurant) {
      form.reset({
        ein_number: restaurant.ein_number || "",
        business_license_number: restaurant.business_license_number || "",
        owner_name: restaurant.owner_name || "",
        owner_ssn_last4: restaurant.owner_ssn_last4 || "",
      });
    }
  }, [restaurant, form]);

  // Handle file selection for driver's license
  const handleDriversLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Verify file type and size
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG or PDF file",
          variant: "destructive"
        });
        return;
      }
      
      // Max 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setDriversLicenseFile(file);
    }
  };

  // Handle file selection for business license
  const handleBusinessLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Verify file type and size
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG or PDF file",
          variant: "destructive"
        });
        return;
      }
      
      // Max 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setBusinessLicenseFile(file);
    }
  };

  // Upload file to Supabase storage
  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}_${Date.now()}.${fileExt}`;
      const filePath = `${restaurant.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (error: any) {
      console.error(`Error uploading ${path}:`, error);
      toast({
        title: `Upload Error`,
        description: `Failed to upload ${path}: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
  };

  // Form submission handler
  const onSubmit = async (values: VerificationFormValues) => {
    setIsSubmitting(true);
    
    try {
      let driversLicenseUrl = restaurant.drivers_license_image_url;
      let businessLicenseUrl = restaurant.business_license_image_url;
      
      // Upload driver's license if provided
      if (driversLicenseFile) {
        setUploadProgress(prev => ({ ...prev, driversLicense: 10 }));
        driversLicenseUrl = await uploadFile(driversLicenseFile, "restaurant_verification", "drivers_license");
        setUploadProgress(prev => ({ ...prev, driversLicense: 100 }));
      }
      
      // Upload business license if provided
      if (businessLicenseFile) {
        setUploadProgress(prev => ({ ...prev, businessLicense: 10 }));
        businessLicenseUrl = await uploadFile(businessLicenseFile, "restaurant_verification", "business_license");
        setUploadProgress(prev => ({ ...prev, businessLicense: 100 }));
      }
      
      // Make sure we have required files
      if (!driversLicenseUrl && !restaurant.drivers_license_image_url) {
        toast({
          title: "Missing document",
          description: "Please upload a copy of your driver's license",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!businessLicenseUrl && !restaurant.business_license_image_url) {
        toast({
          title: "Missing document",
          description: "Please upload a copy of your business license",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Update restaurant with verification details
      const { error } = await supabase
        .from("restaurants")
        .update({
          ein_number: values.ein_number,
          business_license_number: values.business_license_number,
          owner_name: values.owner_name,
          owner_ssn_last4: values.owner_ssn_last4,
          drivers_license_image_url: driversLicenseUrl,
          business_license_image_url: businessLicenseUrl,
          verification_status: 'submitted' // Change status from 'pending' to 'submitted'
        })
        .eq("id", restaurant.id);
        
      if (error) throw error;
      
      // Show success message
      toast({
        title: "Verification submitted",
        description: "Your restaurant verification details have been submitted. We'll review your information shortly.",
      });
      
      // Call the callback if provided
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (error: any) {
      console.error("Verification submission error:", error);
      toast({
        title: "Submission error",
        description: error.message || "There was an error submitting your verification details",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVerificationStatusBadge = () => {
    switch (restaurant?.verification_status) {
      case 'verified':
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full flex items-center">
          <BadgeCheck className="w-4 h-4 mr-1" /> Verified
        </span>;
      case 'submitted':
        return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Under Review</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">Pending</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Restaurant Verification</CardTitle>
          {getVerificationStatusBadge()}
        </div>
        <CardDescription>
          Please provide your business verification details. This information is required to approve events and process payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {restaurant?.verification_status === 'verified' ? (
          <Alert className="bg-green-50 border-green-200">
            <BadgeCheck className="h-5 w-5 text-green-600" />
            <AlertTitle>Verification Complete</AlertTitle>
            <AlertDescription>
              Your restaurant has been successfully verified. You can now approve events and receive payments.
            </AlertDescription>
          </Alert>
        ) : restaurant?.verification_status === 'submitted' ? (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <AlertTitle>Under Review</AlertTitle>
            <AlertDescription>
              Your verification information has been submitted and is currently under review. This process typically takes 1-2 business days.
            </AlertDescription>
          </Alert>
        ) : restaurant?.verification_status === 'rejected' ? (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertTitle>Verification Rejected</AlertTitle>
            <AlertDescription>
              Your verification information has been rejected. Please update the information below and resubmit.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" role="form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ein_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>EIN Number <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="XX-XXXXXXX" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your Employer Identification Number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="business_license_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business License Number <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Business license #" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your state or local business license number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="owner_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Full Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Full legal name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Name as it appears on your ID
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="owner_ssn_last4"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last 4 Digits of SSN <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="XXXX" 
                          maxLength={4} 
                          {...field} 
                          onChange={(e) => {
                            // Only allow numbers
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        For identity verification only
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <FormLabel htmlFor="drivers_license">Driver's License <span className="text-red-500">*</span></FormLabel>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('drivers_license')?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {restaurant.drivers_license_image_url || driversLicenseFile ? 'Replace File' : 'Upload File'}
                    </Button>
                    {(restaurant.drivers_license_image_url || driversLicenseFile) && (
                      <FileText className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <input
                    type="file"
                    id="drivers_license"
                    onChange={handleDriversLicenseChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                  <FormDescription>
                    JPG, PNG or PDF, max 5MB
                  </FormDescription>
                  {uploadProgress.driversLicense > 0 && uploadProgress.driversLicense < 100 && (
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${uploadProgress.driversLicense}%` }}
                      />
                    </div>
                  )}
                  {restaurant.drivers_license_image_url && (
                    <FormDescription className="text-green-600">
                      File already uploaded
                    </FormDescription>
                  )}
                  {driversLicenseFile && (
                    <FormDescription>
                      Selected: {driversLicenseFile.name}
                    </FormDescription>
                  )}
                </div>
                
                <div className="space-y-2">
                  <FormLabel htmlFor="business_license">Business License <span className="text-red-500">*</span></FormLabel>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('business_license')?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {restaurant.business_license_image_url || businessLicenseFile ? 'Replace File' : 'Upload File'}
                    </Button>
                    {(restaurant.business_license_image_url || businessLicenseFile) && (
                      <FileText className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <input
                    type="file"
                    id="business_license"
                    onChange={handleBusinessLicenseChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                  <FormDescription>
                    JPG, PNG or PDF, max 5MB
                  </FormDescription>
                  {uploadProgress.businessLicense > 0 && uploadProgress.businessLicense < 100 && (
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${uploadProgress.businessLicense}%` }}
                      />
                    </div>
                  )}
                  {restaurant.business_license_image_url && (
                    <FormDescription className="text-green-600">
                      File already uploaded
                    </FormDescription>
                  )}
                  {businessLicenseFile && (
                    <FormDescription>
                      Selected: {businessLicenseFile.name}
                    </FormDescription>
                  )}
                </div>
              </div>
              
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-800" />
                <AlertTitle>Information Security</AlertTitle>
                <AlertDescription>
                  Your information is encrypted and securely stored. We comply with all relevant data protection regulations.
                </AlertDescription>
              </Alert>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Verification"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default RestaurantVerificationForm;
