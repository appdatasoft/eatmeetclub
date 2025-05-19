
import { ReactNode } from 'react';

interface RedirectStateProps {
  message?: string;
}

const RedirectState = ({ message = "Redirecting to login..." }: RedirectStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default RedirectState;
