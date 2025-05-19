
import React from 'react';
import MainLayout from "@/components/layout/MainLayout";

const DataDeletion = () => {
  return (
    <MainLayout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-6">Data Deletion Instructions</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">Last updated: May 19, 2025</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">How to Delete Your Data</h2>
          <p>You have several options to manage or delete your data from EatMeetClub:</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Option 1: Using Your Account Settings</h3>
          <p>If you are a registered user, you can manage your data through your account:</p>
          <ol className="list-decimal pl-6 mb-4">
            <li>Log in to your account</li>
            <li>Navigate to "Dashboard" then "My Account"</li>
            <li>Select "Delete My Data" and follow the prompts</li>
          </ol>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Option 2: Contact Us Directly</h3>
          <p>If you prefer or are unable to use the self-service option, you can contact us directly:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Email us at <a href="mailto:info@eatmeetclub.com" className="text-brand-500 hover:underline">info@eatmeetclub.com</a> with the subject line "Data Deletion Request"</li>
            <li>Please include the email address associated with your account</li>
            <li>We will process your request within 30 days and send confirmation when completed</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">What Data Will Be Deleted</h2>
          <p>When you request data deletion, we will delete or anonymize:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your profile information</li>
            <li>Your event history and reservations</li>
            <li>Your payment information (though records may be retained as required by law)</li>
            <li>Any content you've submitted, such as reviews or comments</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Retention</h2>
          <p>Some information may be retained for legal, business, or technical reasons, such as:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Financial transaction records (as required by law)</li>
            <li>Anonymized analytical data</li>
            <li>Information necessary to prevent fraud or future abuse</li>
            <li>Data required to be maintained for legitimate business interests, such as fraud prevention</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>If you have any questions about data deletion or your privacy, please contact us at:</p>
          <p>Email: <a href="mailto:info@eatmeetclub.com" className="text-brand-500 hover:underline">info@eatmeetclub.com</a></p>
        </div>
      </div>
    </MainLayout>
  );
};

export default DataDeletion;
