
export interface TicketRevenue {
  appFee: number;        // Platform fee (fixed or percentage)
  affiliateFee: number;  // Commission for the person who sold the ticket
  ambassadorFee: number; // Fee for the creator/ambassador who created the event
  restaurantRevenue: number; // Revenue for the restaurant (for food/venue)
  totalAmount: number;   // Total ticket amount
}

export interface TicketDistributionConfig {
  appFeePercentage: number;      // Platform fee percentage (e.g., 5%)
  affiliateFeePercentage: number; // Percentage for affiliates
  ambassadorFeePercentage: number; // Default percentage for ambassadors (can be overridden)
}

export interface EventApprovalStatus {
  isPendingApproval: boolean;
  isApproved: boolean;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}
