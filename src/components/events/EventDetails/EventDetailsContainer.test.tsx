
import { render, screen } from "@/lib/test-setup";
import EventDetailsContainer from "./EventDetailsContainer";
import { EventDetails } from "@/types/event";

// Mock the useIsMobile hook
jest.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false
}));

describe("EventDetailsContainer", () => {
  const mockEvent: EventDetails = {
    id: "event-123",
    title: "Test Event",
    description: "A test event description",
    date: "2025-06-15",
    time: "19:00",
    price: 25,
    capacity: 100,
    user_id: "user-123",
    tickets_sold: 20,
    published: true,
    restaurant: {
      id: "restaurant-123",
      name: "Test Restaurant",
      address: "123 Test St",
      city: "Test City",
      state: "Test State",
      zipcode: "12345",
      description: "A fine dining experience",
      logo_url: "https://example.com/logo.png"
    }
  };

  const defaultProps = {
    event: mockEvent,
    ticketsRemaining: 80,
    ticketsPercentage: 20,
    location: "123 Test St, Test City, Test State 12345",
    eventUrl: "https://example.com/event/event-123",
    isCurrentUserOwner: false
  };

  it("renders without crashing", () => {
    render(<EventDetailsContainer {...defaultProps} />);
    expect(screen.getByText(/Event Details/i)).toBeInTheDocument();
  });

  it("passes restaurant logo URL to RestaurantInfo component", () => {
    render(<EventDetailsContainer {...defaultProps} />);
    
    // Check that RestaurantInfo receives the logo URL
    const restaurantLogo = screen.getByAltText("Test Restaurant");
    expect(restaurantLogo).toBeInTheDocument();
    expect(restaurantLogo).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("renders EventInfo with correct data", () => {
    render(<EventDetailsContainer {...defaultProps} />);
    
    expect(screen.getByText("A test event description")).toBeInTheDocument();
    expect(screen.getByText("80 of 100 tickets remaining")).toBeInTheDocument();
  });

  it("displays QR code when not the owner", () => {
    render(<EventDetailsContainer {...defaultProps} />);
    expect(screen.getByText(/Test Event/i)).toBeInTheDocument();
  });

  it("doesn't display QR code when user is owner", () => {
    const ownerProps = {
      ...defaultProps,
      isCurrentUserOwner: true
    };
    
    render(<EventDetailsContainer {...ownerProps} />);
    expect(screen.queryByText(/Scan to view event/i)).not.toBeInTheDocument();
  });

  it("renders restaurant info with fallback when no logo is provided", () => {
    const propsWithoutLogo = {
      ...defaultProps,
      event: {
        ...mockEvent,
        restaurant: {
          ...mockEvent.restaurant,
          logo_url: undefined
        }
      }
    };
    
    render(<EventDetailsContainer {...propsWithoutLogo} />);
    expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
  });
});
