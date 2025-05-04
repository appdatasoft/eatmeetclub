
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MembershipConfirmed = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Optionally clear localStorage or form cache after confirmation
    localStorage.removeItem("signup_firstName");
    localStorage.removeItem("signup_lastName");
    localStorage.removeItem("signup_email");
    localStorage.removeItem("signup_phone");
    localStorage.removeItem("signup_address");
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">🎉 You're In!</h1>
      <p className="text-lg mb-3">Welcome to <strong>Eat Meet Club</strong> — your membership has been successfully confirmed.</p>
      <p className="mb-6">Get ready to unlock exclusive dining experiences and connect with fellow food enthusiasts!</p>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-green-800 mb-2">What's Next?</h2>
        <ul className="text-left text-green-700 space-y-2">
          <li>✅ Browse upcoming events and reserve your spot</li>
          <li>✅ Create your dining profile</li>
          <li>✅ Connect with other members</li>
        </ul>
      </div>
      
      <button 
        onClick={() => navigate("/events")} 
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-full transition-colors mb-4"
      >
        Explore Events
      </button>
      
      <div className="text-sm text-gray-500 mt-8">
        <p>A confirmation email has been sent to your inbox.</p>
        <p>If you have any questions, contact us at <a href="mailto:support@eatmeetclub.com" className="text-emerald-600 hover:underline">support@eatmeetclub.com</a></p>
      </div>
    </div>
  );
};

export default MembershipConfirmed;
