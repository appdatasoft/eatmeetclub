
/**
 * Utilities for mapping between UI template types and API template types
 */

export type UITemplateType = 'venue' | 'salesRep' | 'ticket';
export type APITemplateType = 'restaurant' | 'restaurant_referral' | 'ticket_sales';

/**
 * Maps UI template types to API template types
 */
export const mapToAPITemplateType = (templateType: string): APITemplateType => {
  switch(templateType) {
    case "venue":
      return "restaurant";
    case "salesRep":
      return "restaurant_referral";
    case "ticket":
      return "ticket_sales";
    default:
      return "restaurant";
  }
};
