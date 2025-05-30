
import { render, screen } from "@/lib/test-setup";
import RestaurantInfo from "./RestaurantInfo";
import { describe, it, expect } from "vitest";

describe("RestaurantInfo", () => {
  const defaultProps = {
    restaurant: {
      id: "restaurant-123",
      name: "Test Restaurant",
      description: "A test restaurant description", 
      logo_url: undefined,
      address: '',
      city: '',
      state: '',
      zipcode: ''
    },
    isCurrentUserOwner: false
  };

  it("renders without crashing", () => {
    render(<RestaurantInfo {...defaultProps} />);
    expect(screen.getByText("Test Restaurant")).toBeInTheDocument();
  });

  it("displays restaurant description", () => {
    render(<RestaurantInfo {...defaultProps} />);
    expect(screen.getByText("A test restaurant description")).toBeInTheDocument();
  });

  it("renders avatar fallback when no logo URL is provided", () => {
    render(<RestaurantInfo {...defaultProps} />);
    expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
  });

  it("renders restaurant logo when a valid URL is provided", () => {
    const propsWithLogo = {
      restaurant: {
        ...defaultProps.restaurant,
        logo_url: "https://example.com/logo.png"
      },
      isCurrentUserOwner: false
    };
    
    render(<RestaurantInfo {...propsWithLogo} />);
    const logoImg = screen.getByAltText("Test Restaurant");
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("renders link to restaurant page when valid restaurant id is provided", () => {
    render(<RestaurantInfo {...defaultProps} />);
    const link = screen.getByText("Test Restaurant").closest("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/restaurant/restaurant-123");
  });

  it("does not render link when restaurant id is 'unknown'", () => {
    const propsWithUnknownId = {
      restaurant: {
        ...defaultProps.restaurant,
        id: "unknown"
      },
      isCurrentUserOwner: false
    };
    
    render(<RestaurantInfo {...propsWithUnknownId} />);
    expect(screen.getByText("Test Restaurant")).not.toHaveAttribute("href");
  });

  it("renders view restaurant profile link when valid id is provided", () => {
    render(<RestaurantInfo {...defaultProps} />);
    expect(screen.getByText("View Restaurant Profile")).toBeInTheDocument();
  });

  it("does not render view profile link when id is 'unknown'", () => {
    const propsWithUnknownId = {
      restaurant: {
        ...defaultProps.restaurant,
        id: "unknown"
      },
      isCurrentUserOwner: false
    };
    
    render(<RestaurantInfo {...propsWithUnknownId} />);
    expect(screen.queryByText("View Restaurant Profile")).not.toBeInTheDocument();
  });
});
