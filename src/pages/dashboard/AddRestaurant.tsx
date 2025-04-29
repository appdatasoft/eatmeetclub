
import DashboardLayout from '@/components/layout/DashboardLayout';
import AddRestaurantForm from '@/components/restaurants/AddRestaurantForm';
import { useRestaurantCreate } from '@/components/restaurants/hooks/useRestaurantCreate';
import { useAuthCheck } from '@/components/restaurants/hooks/useAuthCheck';

const AddRestaurant = () => {
  // Check if user is authenticated
  useAuthCheck();
  
  // Get restaurant creation functionality
  const { isLoading, addRestaurant } = useRestaurantCreate();

  const handleSubmit = async (formData: any) => {
    // Map form data to match the format expected by the database
    const restaurantData = {
      name: formData.name,
      cuisine_type: formData.cuisine_type,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipcode: formData.zipcode,
      phone: formData.phone,
      website: formData.website || null
    };
    
    await addRestaurant(restaurantData);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Add New Restaurant</h1>
      <AddRestaurantForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </DashboardLayout>
  );
};

export default AddRestaurant;
