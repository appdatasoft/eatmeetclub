
export interface VerificationParams {
  paymentId: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  isSubscription?: boolean;
  forceCreateUser?: boolean;
  sendPasswordEmail?: boolean;
  createMembershipRecord?: boolean;
  sendInvoiceEmail?: boolean;
  preventDuplicateEmails?: boolean;
  simplifiedVerification?: boolean;
  safeMode?: boolean;
}

export interface RequestOptions {
  phone?: string;
  address?: string;
  isSubscription?: boolean;
  forceCreateUser?: boolean;
  sendPasswordEmail?: boolean;
  createMembershipRecord?: boolean;
  sendInvoiceEmail?: boolean;
  preventDuplicateEmails?: boolean;
  simplifiedVerification?: boolean;
  safeMode?: boolean;
  retry?: boolean;
  maxRetries?: number;
  forceSendEmails?: boolean;
}

export interface MembershipFormState {
  name: string;
  email: string;
  phone: string;
  address: string;
}
