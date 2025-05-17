
import { fetchEventDetails } from "./eventDetailsFetcher";
import { supabase } from "@/integrations/supabase/client";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis()
  }
}));

describe("eventDetailsFetcher", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("correctly fetches event details with restaurant logo", async () => {
    // Mock successful response with logo_url
    const mockEventData = {
      id: "event-123",
      title: "Test Event",
      description: "A test event",
      date: "2025-06-15",
      time: "19:00",
      price: 25,
      capacity: 100,
      user_id: "user-123",
      tickets_sold: 50,
      published: true,
      restaurants: {
        id: "restaurant-123",
        name: "Test Restaurant",
        address: "123 Test St",
        city: "Test City",
        state: "Test State",
        zipcode: "12345",
        description: "A fine dining establishment",
        logo_url: "https://example.com/logo.png"
      }
    };

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockEventData, error: null })
    });

    const result = await fetchEventDetails("event-123");

    // Verify supabase was called correctly
    expect(supabase.from).toHaveBeenCalledWith("events");
    
    // Verify select included logo_url
    expect((supabase.from as any)().select).toHaveBeenCalledWith(
      expect.stringContaining("logo_url")
    );

    // Verify the returned data contains the logo_url
    expect(result).toHaveProperty("restaurant.logo_url", "https://example.com/logo.png");
  });

  it("handles missing logo_url gracefully", async () => {
    // Mock response without logo_url
    const mockEventData = {
      id: "event-123",
      title: "Test Event",
      restaurants: {
        id: "restaurant-123",
        name: "Test Restaurant",
        // No logo_url provided
      }
    };

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockEventData, error: null })
    });

    const result = await fetchEventDetails("event-123");

    // Verify the returned data handles missing logo_url
    expect(result).toHaveProperty("restaurant.logo_url", "");
  });

  it("handles case where restaurant data is null", async () => {
    // Mock response without restaurant data
    const mockEventData = {
      id: "event-123",
      title: "Test Event",
      restaurants: null
    };

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockEventData, error: null })
    });

    const result = await fetchEventDetails("event-123");

    // Verify default restaurant object is created
    expect(result).toHaveProperty("restaurant.id", "unknown");
    expect(result).toHaveProperty("restaurant.name", "Unknown Restaurant");
    expect(result).toHaveProperty("restaurant.logo_url", "");
  });
});
