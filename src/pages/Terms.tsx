
import React from 'react';
import MainLayout from "@/components/layout/MainLayout";

const Terms = () => {
  return (
    <MainLayout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">Last updated: May 19, 2025</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>Welcome to EatMeetClub. These Terms of Service govern your use of our website and services. By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Accounts</h2>
          <p>When you create an account with us, you guarantee that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.</p>
          <p>You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Event Participation</h2>
          <p>Our service allows you to discover and participate in dining events at partner restaurants. By registering for an event through our platform:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>You commit to attending the event as scheduled or canceling within the stated cancellation window.</li>
            <li>You agree to follow the restaurant's rules and standards of conduct while at the event.</li>
            <li>You understand that payment for events is processed through our platform and is subject to our payment and refund policies.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Restaurant Partners</h2>
          <p>Restaurants that partner with EatMeetClub agree to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate information about their venue, menus, and available event slots.</li>
            <li>Honor all bookings made through the platform.</li>
            <li>Provide the services as described in the event listing.</li>
            <li>Comply with all applicable food safety, health, and business regulations.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Payments and Fees</h2>
          <p>Our platform facilitates payments between users and restaurant partners. By using our services:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>You agree to pay all fees and charges associated with your account on the applicable payment dates.</li>
            <li>You authorize us to charge your chosen payment method for any such fees and charges.</li>
            <li>You understand that we may introduce new services or modify existing service fees at any time, with proper notice.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cancellation and Refund Policy</h2>
          <p>Event cancellations and refunds are subject to the following terms:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Users may cancel event registrations up to 48 hours before the scheduled event time for a full refund.</li>
            <li>Cancellations within 48 hours of the event may not be eligible for a refund.</li>
            <li>If a restaurant cancels an event, all registered users will receive a full refund.</li>
            <li>EatMeetClub reserves the right to cancel an event if minimum participation requirements are not met.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
          <p>In no event shall EatMeetClub, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>Email: terms@eatmeetclub.com</p>
          <p>Or you can write to us at:</p>
          <p>EatMeetClub<br />123 Dining Street<br />Foodville, FC 12345<br />United States</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Terms;
