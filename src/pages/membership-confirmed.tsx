import { useEffect } from "react";
import { useRouter } from "next/router";

const MembershipConfirmed = () => {
  const router = useRouter();

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
      <p className="mb-6">Get ready to unlock exclusive

  