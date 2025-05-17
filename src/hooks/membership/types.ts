
export interface VerificationParams {
  paymentId: string;
  email: string;
  name: string;
}

export interface RequestOptions {
  phone?: string | null;
  address?: string | null;
  isSubscription?: boolean;
  forceCreateUser?: boolean;
  sendPasswordEmail?: boolean;
  createMembershipRecord?: boolean;
  sendInvoiceEmail?: boolean;
  preventDuplicateEmails?: boolean;
  simplifiedVerification?: boolean;
  safeMode?: boolean;
  forceSendEmails?: boolean;
}
