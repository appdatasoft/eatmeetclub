import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEventFilters } from '../useEventFilters';
import { EventCardProps } from '@/components/events/EventCard';

describe('useEventFilters hook', () => {
  // Test fixtures with all required properties
  const mockEvents: EventCardProps[] = [
    {
      id: 'event1',
      title: 'Summer Cookout',
      date: 'July 4, 2025',
      time: '6:00 PM',
      price: 25,
      location: 'Downtown NYC',
      category: 'dinner',  // Changed from 'food' to 'dinner'
      image: '/path/to/image1.jpg',
      restaurantName: 'Riverside Grill'
    },
    {
      id: 'event2',
      title: 'Wine Tasting',
      date: 'August 15, 2025',
      time: '7:30 PM',
      price: 75,
      location: 'Brooklyn, NYC',
      category: 'dinner',  // Changed from 'drinks' to 'dinner'
      image: '/path/to/image2.jpg',
      restaurantName: 'Vineyard Bistro'
    },
    {
      id: 'event3',
      title: 'Cooking Class',
      date: 'July 4, 2025',
      time: '2:00 PM',
      price: 120,
      location: 'Manhattan',
      category: 'lunch',  // Changed from 'food' to 'lunch'
      image: '/path/to/image3.jpg',
      restaurantName: 'Culinary Institute'
    }
  ];

  it('should initialize with all events and default filters', () => {
    const { result } = renderHook(() => useEventFilters(mockEvents));
    
    expect(result.current.filters).toEqual({
      category: 'all',
      date: '',
      price: '',
      location: ''
    });
    
    // With no filters applied, all events should be shown
    expect(result.current.filteredEvents).toEqual(mockEvents);
  });
  
  it('should filter events by category', () => {
    const { result } = renderHook(() => useEventFilters(mockEvents));
    
    act(() => {
      result.current.handleFilterChange('category', 'lunch');
    });
    
    // Should have one "lunch" category event
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('event3');
    
    // Change to dinner
    act(() => {
      result.current.handleFilterChange('category', 'dinner');
    });
    
    // Should have two "dinner" category events
    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents[0].id).toBe('event1');
    expect(result.current.filteredEvents[1].id).toBe('event2');
  });
  
  it('should filter events by date', () => {
    const { result } = renderHook(() => useEventFilters(mockEvents));
    
    // Hard-coded date matching July 4, 2025
    act(() => {
      result.current.handleFilterChange('date', '2025-07-04');
    });
    
    // Should have two events on July 4
    expect(result.current.filteredEvents).toHaveLength(2);
    expect(result.current.filteredEvents[0].id).toBe('event1');
    expect(result.current.filteredEvents[1].id).toBe('event3');
  });
  
  it('should filter events by price range', () => {
    const { result } = renderHook(() => useEventFilters(mockEvents));
    
    // Price range 50-100
    act(() => {
      result.current.handleFilterChange('price', '50-100');
    });
    
    // Only one event in this range
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('event2');
    
    // Price over 100
    act(() => {
      result.current.handleFilterChange('price', '100+');
    });
    
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('event3');
  });
  
  it('should filter events by location', () => {
    const { result } = renderHook(() => useEventFilters(mockEvents));
    
    // Filter for NYC
    act(() => {
      result.current.handleFilterChange('location', 'NYC');
    });
    
    // Should match 2 events with NYC in the location
    expect(result.current.filteredEvents).toHaveLength(2);
    
    // More specific location
    act(() => {
      result.current.handleFilterChange('location', 'Brooklyn');
    });
    
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('event2');
  });
  
  it('should apply multiple filters together', () => {
    const { result } = renderHook(() => useEventFilters(mockEvents));
    
    // Apply category filter
    act(() => {
      result.current.handleFilterChange('category', 'lunch');
    });
    
    // Apply date filter on top of that
    act(() => {
      result.current.handleFilterChange('date', '2025-07-04');
    });
    
    // Should have 1 event matching both filters
    expect(result.current.filteredEvents).toHaveLength(1);
    
    // Add price filter to narrow it down further
    act(() => {
      result.current.handleFilterChange('price', '100+');
    });
    
    // Now should only have 1 event matching all criteria
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].id).toBe('event3');
  });
  
  it('should handle empty events array', () => {
    const { result } = renderHook(() => useEventFilters([]));
    
    expect(result.current.filteredEvents).toEqual([]);
    
    // Applying filters should not cause errors
    act(() => {
      result.current.handleFilterChange('category', 'lunch');
    });
    
    expect(result.current.filteredEvents).toEqual([]);
  });
});
