
/**
 * Maps frontend template types to backend template types
 */

export const mapToAPITemplateType = (frontendType: string): "restaurant" | "restaurant_referral" | "ticket_sales" => {
  switch (frontendType) {
    case 'venue':
      return 'restaurant';
    case 'salesRep':
      return 'restaurant_referral';
    case 'ticket':
      return 'ticket_sales';
    default:
      return 'restaurant'; // Default to restaurant if unknown type
  }
};

// Adding an alias for backward compatibility
export const mapTemplateType = mapToAPITemplateType;

