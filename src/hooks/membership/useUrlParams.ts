
import { useSearchParams } from "react-router-dom";

export const useUrlParams = () => {
  const [searchParams] = useSearchParams();
  
  const paymentCanceled = searchParams.get('canceled') === 'true';
  const paymentSuccess = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');

  return {
    paymentCanceled,
    paymentSuccess,
    sessionId
  };
};

export default useUrlParams;
