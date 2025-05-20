
import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import AffiliateLinksTable from "@/components/dashboard/AffiliateLinks/AffiliateLinksTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AffiliateLinks = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Links</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your affiliate links for event promotions
          </p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How it Works</CardTitle>
            <CardDescription>
              Share your affiliate links and earn credit for referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal ml-5 space-y-2">
              <li>Visit an event page and generate your unique affiliate link</li>
              <li>Share the link with your friends and on social media</li>
              <li>Track clicks and ticket purchases made through your link</li>
              <li>Earn rewards when people purchase tickets using your link</li>
            </ol>
          </CardContent>
        </Card>
        
        <AffiliateLinksTable />
      </div>
    </DashboardLayout>
  );
};

export default AffiliateLinks;
