
import { useParams, useNavigate } from "react-router-dom";
import { useEventFetch } from "@/hooks/useEventFetch";
import { useAuth } from "@/hooks/useAuth";
import { useEventAccess } from "@/hooks/useEventAccess";
import { useEventActions } from "@/hooks/useEventActions";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useReferralTracking } from "@/hooks/useReferralTracking";
import { checkSupabaseConnection } from "@/integrations/supabase/utils/connectionUtils";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventHeader from "@/components/events/EventHeader";
import EventDetailsContent from "@/components/events/EventDetails/EventDetailsContent";
import EventSkeleton from "@/components/events/EventDetails/EventSkeleton";
import EventNotFound from "@/components/events/EventDetails/EventNotFound";
import DeleteEventDialog from "@/components/events/EventDetails/DeleteEventDialog";
import EditCoverDialog from "@/components/events/EventDetails/EditCoverDialog";
import MenuSelectionModal from "@/components/events/menu-selection";
import AffiliateShare from "@/components/events/AffiliateShare";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Menu as MenuIcon, RefreshCw, Info, AlertTriangle } from "lucide-react";
import { EventDetails } from "@/hooks/types/eventTypes";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EventDetailsPage = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const getEventIdFromParams = () => {
    if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return id;
    }
    const uuidMatch = id?.match(/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i) ||
                      slug?.match(/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i);
    return uuidMatch?.[1] || id || slug || '';
  };

  const eventId = getEventIdFromParams();
  
  useEffect(() => {
    // Check connection to Supabase when component mounts
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection(true);
      if (!isConnected) {
        setConnectionError("Unable to connect to the database. Please check your internet connection and try again.");
      } else {
        setConnectionError(null);
      }
    };
    
    checkConnection();
  }, []);
  
  const { event, isLoading, error, isCurrentUserOwner, refreshEventDetails } = useEventFetch(eventId);
  const { referralCode } = useReferralTracking(eventId);

  const [isMenuSelectionOpen, setIsMenuSelectionOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (eventId && referralCode) {
      console.log(`Viewing event ${eventId} with referral code: ${referralCode}`);
    }
  }, [eventId, referralCode]);

  useEffect(() => {
    const safeError = typeof error === "string" ? error : String(error);
    if (safeError && !safeError.includes("not found") && !safeError.includes("Invalid")) {
      toast({
        title: "Error loading event",
        description: safeError,
        variant: "destructive"
      });
    }
  }, [error]);

  // Format the error message for display
  const safeError = typeof error === "string" ? error : String(error);

  if (safeError.includes("body stream already read")) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-12 text-center text-red-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unexpected error occurred</h2> 
          <p>Please refresh the page to try again.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Page
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  const { canEditEvent } = useEventAccess(event as EventDetails);

  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    isEditCoverDialogOpen,
    setIsEditCoverDialogOpen,
    isUploadingCover,
    handleEditEvent,
    handleEditCover,
    handleSaveCover,
    handleDeleteEvent,
    handleTicketPurchase,
    isPaymentProcessing,
  } = useEventActions(event as EventDetails, refreshEventDetails, canEditEvent, user);

  const processTicketPurchase = (ticketCount: number) => {
    if (user) {
      handleTicketPurchase(ticketCount);
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    if (connectionError) {
      checkSupabaseConnection(true)
        .then(isConnected => {
          if (isConnected) {
            setConnectionError(null);
            refreshEventDetails();
          } else {
            toast({
              title: "Connection Error",
              description: "Still unable to connect to the database. Please try again later.",
              variant: "destructive"
            });
          }
        })
        .finally(() => setIsRetrying(false));
    } else {
      refreshEventDetails().finally(() => setIsRetrying(false));
    }
  };

  const handleManageMenu = () => {
    if (event?.restaurant?.id) {
      navigate(`/dashboard/restaurant-menu/${event.restaurant.id}?eventId=${event.id}&eventName=${encodeURIComponent(event.title)}`);
    } else {
      toast({
        title: "Error",
        description: "Restaurant information is missing",
        variant: "destructive"
      });
    }
  };

  const eventUrl = window.location.href;
  const eventSlug = event?.title
    ? event.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')
    : '';

  const ticketsRemaining = (event?.capacity || 0) - (event?.tickets_sold || 0);
  const ticketsPercentage = ((event?.tickets_sold || 0) / (event?.capacity || 1)) * 100;
  const coverImageUrl = event?.cover_image || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=60";

  if (connectionError) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-bold mb-4">Connection Error</h2>
          <p className="mb-6 text-gray-600">{connectionError}</p>
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying} 
            className="flex items-center mx-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Connecting...' : 'Try Again'}
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-8 md:py-12">
          <EventSkeleton />
        </div>
        <Footer />
      </>
    );
  }

  if (!event || safeError) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-8">
          <EventNotFound error={safeError} />
          {safeError && !safeError.includes("not found") && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex items-center"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry Loading'}
              </Button>
            </div>
          )}
        </div>
        <Footer />
      </>
    );
  }

  if (!event.title) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-12 text-center text-gray-600">
          <div className="animate-pulse">
            <div className="h-8 w-1/3 bg-gray-200 rounded mx-auto mb-4"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded mx-auto"></div>
          </div>
          <p className="mt-6">Loading event details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!event.published && !canEditEvent) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Available</h1>
          <p className="mb-6">This event is not currently published.</p>
          <Button variant="outline" onClick={() => navigate('/events')}>
            Browse Events
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-white">
        <EventHeader 
          title={event.title}
          restaurantName={event.restaurant?.name || "Unknown Restaurant"}
          restaurantId={event.restaurant?.id || "unknown"}
          isOwner={canEditEvent}
          onEditCover={handleEditCover}
          coverImage={coverImageUrl}
        />

        <div className="container-custom pt-4">
          <div className="flex flex-wrap gap-2">
            {referralCode && (
              <Alert className="mb-4 w-full bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  You're viewing this event through an affiliate link (ref: {referralCode})
                </AlertDescription>
              </Alert>
            )}

            {user && (
              <Button
                variant="outline"
                className="border-dashed"
                onClick={() => setIsMenuSelectionOpen(true)}
              >
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Select Menu Items
              </Button>
            )}

            {canEditEvent && event.restaurant?.id && (
              <Button variant="outline" onClick={handleManageMenu}>
                <MenuIcon className="h-4 w-4 mr-2" />
                Manage Menu
              </Button>
            )}
          </div>
        </div>

        <EventDetailsContent
          event={event}
          ticketsRemaining={ticketsRemaining}
          ticketsPercentage={ticketsPercentage}
          eventUrl={eventUrl}
          isCurrentUserOwner={isCurrentUserOwner}
          canEditEvent={canEditEvent}
          handleTicketPurchase={processTicketPurchase}
          handleEditEvent={handleEditEvent}
          handleDeleteEvent={() => setIsDeleteDialogOpen(true)}
          isPaymentProcessing={isPaymentProcessing}
          user={user}
          referralCode={referralCode}
        />

        {user && (
          <div className="container-custom py-4 mb-6">
            <AffiliateShare 
              eventId={event.id}
              eventTitle={event.title}
              eventSlug={eventSlug}
            />
          </div>
        )}
      </div>
      <Footer />

      <DeleteEventDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteEvent}
        isDeleting={isDeleting}
      />

      <EditCoverDialog
        isOpen={isEditCoverDialogOpen}
        onClose={() => setIsEditCoverDialogOpen(false)}
        onSave={handleSaveCover}
        isUploading={isUploadingCover}
      />

      {event?.restaurant?.id && (
        <MenuSelectionModal
          eventId={event.id}
          restaurantId={event.restaurant.id}
          isOpen={isMenuSelectionOpen}
          onClose={() => setIsMenuSelectionOpen(false)}
        />
      )}
    </>
  );
};

export default EventDetailsPage;
