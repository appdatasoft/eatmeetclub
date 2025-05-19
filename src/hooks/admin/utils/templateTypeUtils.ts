
/**
 * Maps UI template types to API template types
 */
export function mapToAPITemplateType(templateType: string): "restaurant" | "restaurant_referral" | "ticket_sales" {
  switch (templateType) {
    case 'venue':
      return 'restaurant';
    case 'salesRep':
      return 'restaurant_referral';
    case 'ticket':
      return 'ticket_sales';
    default:
      return 'restaurant';
  }
}

/**
 * Maps API template types to UI template types
 */
export function mapFromAPITemplateType(apiType: string): "venue" | "salesRep" | "ticket" {
  switch (apiType) {
    case 'restaurant':
      return 'venue';
    case 'restaurant_referral':
      return 'salesRep';
    case 'ticket_sales':
      return 'ticket';
    default:
      return 'venue';
  }
}
