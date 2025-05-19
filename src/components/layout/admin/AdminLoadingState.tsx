
import Navbar from '../Navbar';
import Footer from '../Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useEffect, useState } from 'react';

interface AdminLoadingStateProps {
  text?: string;
}

const AdminLoadingState = ({ text = "Loading admin panel..." }: AdminLoadingStateProps) => {
  const [loadingStage, setLoadingStage] = useState(1);

  // Show progressive loading messages for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingStage(2);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const getLoadingText = () => {
    switch (loadingStage) {
      case 1:
        return text;
      case 2:
        return "Verifying admin privileges...";
      default:
        return text;
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="medium" text={getLoadingText()} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLoadingState;
