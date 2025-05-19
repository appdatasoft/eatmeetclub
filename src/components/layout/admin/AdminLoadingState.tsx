
import Navbar from '../Navbar';
import Footer from '../Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AdminLoadingStateProps {
  text?: string;
}

const AdminLoadingState = ({ text = "Verifying admin credentials..." }: AdminLoadingStateProps) => {
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="medium" text={text} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLoadingState;
