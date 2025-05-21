
import { render, screen } from "@/lib/test-setup";
import { EventDetails } from "@/types/event";
import { describe, it, expect, vi } from "vitest";
import EventDetailsContainer from "./EventDetailsContainer";

// Mock useIsMobile hook
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => false)
}));

describe("EventDetailsContainer", () => {
  const mockEvent: EventDetails = {
    id: "event-123",
    title: "Test Event",
    description: "Test Description",
    date: "2025-05-20",
    time: "19:00",
    price: 25,
    capacity: 100,
    user_id: "user-123",
    published: true,
    restaurant: {
      id: "restaurant-123",
      name: "Test Restaurant",
      address: "123 Main St",
      city: "Test City",
      state: "TS",
      zipcode: "12345",
      description: "Test restaurant description",
      logo_url: null
    },
    cover_image: null,
    tickets_sold: 30
  };

  const defaultProps = {
    event: mockEvent,
    ticketsRemaining: 70,
    ticketsPercentage: 30,
    location: "123 Main St, Test City, TS 12345",
    eventUrl: "https://example.com/event/123",
    isCurrentUserOwner: false
  };

  it("renders event info correctly", () => {
    render(<EventDetailsContainer {...defaultProps} />);
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders restaurant info correctly", () => {
    render(<EventDetailsContainer {...defaultProps} />);
    expect(screen.getByText("Test Restaurant")).toBeInTheDocument();
    expect(screen.getByText("Test restaurant description")).toBeInTheDocument();
  });

  it("renders QR code when not owner", () => {
    render(<EventDetailsContainer {...defaultProps} />);
    expect(screen.getByTestId("event-qr-code")).toBeInTheDocument();
  });

  it("does not render QR code when user is owner", () => {
    render(<EventDetailsContainer {...defaultProps} isCurrentUserOwner={true} />);
    expect(screen.queryByTestId("event-qr-code")).not.toBeInTheDocument();
  });

  it("renders with restaurant logo when available", () => {
    const eventWithLogo = {
      ...mockEvent,
      restaurant: {
        ...mockEvent.restaurant,
        logo_url: "https://example.com/logo.png"
      }
    };
    
    render(<EventDetailsContainer {...defaultProps} event={eventWithLogo} />);
    expect(screen.getByAltText("Test Restaurant")).toBeInTheDocument();
  });

  it("renders fallback when logo not available", () => {
    render(<EventDetailsContainer {...defaultProps} />);
    expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
  });
});
