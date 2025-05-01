
import React from "react";

const MembershipBenefits = () => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-4">Membership Benefits</h2>
      <ul className="space-y-2">
        <li className="flex items-start">
          <svg className="h-5 w-5 text-brand-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Early access to exclusive events</span>
        </li>
        <li className="flex items-start">
          <svg className="h-5 w-5 text-brand-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Discounted event tickets</span>
        </li>
        <li className="flex items-start">
          <svg className="h-5 w-5 text-brand-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Member-only community access</span>
        </li>
        <li className="flex items-start">
          <svg className="h-5 w-5 text-brand-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Monthly newsletter with insider tips</span>
        </li>
      </ul>
    </div>
  );
};

export default MembershipBenefits;
