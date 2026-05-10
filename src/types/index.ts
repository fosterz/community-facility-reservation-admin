// --- Auth ---
export interface LoginCredentials {
  email: string
  password: string
}

export interface MfaVerifyPayload {
  userId: string
  code: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'platform_admin' | 'community_admin' | 'staff'
  tenantId?: string
  tenantName?: string
  isTotpVerified?: boolean
}

// --- API ---
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  limit: number
}

// --- Platform ---
export interface Tenant {
  id: string
  name: string
  slug: string
  status: 'Trial' | 'Active' | 'Suspended' | 'Cancelled' | 'Expired'
  address: TenantAddress
  contactPerson: ContactPerson
  subscriptionPlanId?: string
  createdAt: string
  updatedAt?: string
}

export interface TenantAddress {
  street: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface ContactPerson {
  name: string
  email: string
  mobile: string
}

export interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  maxMembers: number
  maxFacilities: number
  maxAdmins: number
  isActive: boolean
  features: PlanFeatureFlags
}

export interface PlanFeatureFlags {
  waitlist: boolean
  guestBooking: boolean
  paidFacilities: boolean
  announcements: boolean
  bulkMemberImport: boolean
  advancedReports: boolean
  staffRoles: boolean
  communityDiscovery: boolean
}

export interface Subscription {
  id: string
  tenantId: string
  planId: string
  planName: string
  status: 'Trial' | 'Active' | 'PastDue' | 'Cancelled' | 'Expired'
  startDate: string
  endDate: string
  trialEndDate?: string
}

export interface JoinRequest {
  id: string
  tenantId: string
  tenantName: string
  applicantName: string
  applicantMobile: string
  unitNumber: string
  status: 'Pending' | 'Approved' | 'Rejected'
  createdAt: string
}

// --- Community ---
export interface Member {
  id: string
  membershipId: string
  name: string
  mobile: string
  email?: string
  unit: string
  status: 'Active' | 'Suspended' | 'Pending'
  forcePasswordChange: boolean
  profilePhoto?: string
  createdAt: string
}

export interface Admin {
  id: string
  name: string
  email: string
  role: 'CommunityAdmin' | 'Staff'
  isActive: boolean
  createdAt: string
}

export interface Facility {
  id: string
  name: string
  category: string
  description?: string
  capacity: number
  status: 'Active' | 'Maintenance' | 'Closed'
  imageUrl?: string
  pricing: FacilityPricing
  bookingConfig: BookingConfig
  waitlistConfig: WaitlistConfig
  createdAt: string
}

export interface FacilityPricing {
  isPaid: boolean
  chargePerSlot: number
  peakHourSurcharge: number
  refundPolicy: string
}

export interface BookingConfig {
  slotDurationMinutes: number
  advanceBookingDays: number
  cancellationCutoffHours: number
  maxSlotsPerBooking: number
  maxBookingsPerDayPerMember: number
}

export interface WaitlistConfig {
  enabled: boolean
  maxPerSlot: number
  autoPromote: boolean
}

export interface Booking {
  id: string
  bookingRef: string
  memberId: string
  memberName: string
  memberUnit: string
  facilityId: string
  facilityName: string
  date: string
  slots: BookingSlot[]
  status: 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow' | 'Waitlisted'
  paymentStatus: 'Free' | 'Pending' | 'Paid'
  amountDue: number
  amountPaid?: number
  createdAt: string
}

export interface BookingSlot {
  startTime: string
  endTime: string
}

export interface Invoice {
  id: string
  invoiceNo: string
  bookingId: string
  bookingRef: string
  memberName: string
  memberUnit: string
  facilityName: string
  subtotal: number
  taxPercent: number
  taxAmount: number
  total: number
  paymentStatus: string
  paidAt: string
  createdAt: string
}

export interface TenantSettings {
  communityProfile: {
    description: string
    logoUrl?: string
    bannerUrl?: string
    website?: string
  }
  documentPrefixes: {
    membershipId: string
    bookingRef: string
    invoiceNo: string
    receiptNo: string
  }
  invoiceSettings: {
    taxPercent: number
    footerNote: string
  }
  bookingPolicies: {
    requireApproval: boolean
    allowGuestBooking: boolean
    guestFeePercent: number
  }
}

export interface Announcement {
  id: string
  title: string
  body: string
  facilityId?: string
  sentAt: string
  sentBy: string
  recipientCount: number
}
