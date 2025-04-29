
import React from "react";
import { Button } from "@/components/common/Button";

const EventNotFound = () => {
  return (
    <div className="container-custom py-12 text-center">
      <h2 className="text-2xl font-semibold mb-4">Event Not Found</h2>
      <p className="mb-6">Sorry, the event you're looking for doesn't exist or has been removed.</p>
      <Button href="/events">Browse Events</Button>
    </div>
  );
};

export default EventNotFound;
