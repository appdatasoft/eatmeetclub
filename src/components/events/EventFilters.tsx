
import { Button } from "@/components/ui/button";
import { FilterState } from "@/hooks/useEventFilters";

interface EventFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
}

const EventFilters = ({ filters, onFilterChange }: EventFiltersProps) => {
  const handleCategoryChange = (category: string) => {
    onFilterChange("category", category);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="mb-4">
        <h3 className="font-medium mb-3">Event Type</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filters.category === "all" ? "default" : "outline"}
            onClick={() => handleCategoryChange("all")}
          >
            All Events
          </Button>
          <Button
            size="sm"
            variant={filters.category === "breakfast" ? "default" : "outline"}
            onClick={() => handleCategoryChange("breakfast")}
          >
            Breakfast
          </Button>
          <Button
            size="sm"
            variant={filters.category === "lunch" ? "default" : "outline"}
            onClick={() => handleCategoryChange("lunch")}
          >
            Lunch
          </Button>
          <Button
            size="sm"
            variant={filters.category === "dinner" ? "default" : "outline"}
            onClick={() => handleCategoryChange("dinner")}
          >
            Dinner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            value={filters.date}
            onChange={(e) => onFilterChange("date", e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-2">
            Price Range
          </label>
          <select
            id="price"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            value={filters.price}
            onChange={(e) => onFilterChange("price", e.target.value)}
          >
            <option value="">Any price</option>
            <option value="0-25">$0 - $25</option>
            <option value="25-50">$25 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100+">$100+</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            placeholder="City or zip code"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            value={filters.location}
            onChange={(e) => onFilterChange("location", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default EventFilters;
