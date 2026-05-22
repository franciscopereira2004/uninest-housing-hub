export type UserRole = "student" | "landlord" | "admin";

export interface StudentProfile {
  university?: string;
  city?: string;
  bio?: string;
}

export interface LandlordProfile {
  phone?: string;
  companyName?: string;
  description?: string;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isBlocked?: boolean;
  studentProfile?: StudentProfile;
  landlordProfile?: LandlordProfile;
  createdAt: string;
  updatedAt?: string;
}

export type PropertyType = "room" | "apartment" | "studio" | "shared_house";

export type ListingStatus = "pending" | "approved" | "rejected" | "suspended";

export interface ListingImage {
  url: string;
  publicId?: string;
  order: number;
}

export interface LandlordSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  companyName?: string;
}

export interface Listing {
  id: string;
  landlordId: string;
  landlord?: LandlordSummary;
  title: string;
  description: string;
  propertyType: PropertyType;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  nearbyUniversity: string;
  distanceToUniversity: number;
  monthlyPrice: number;
  depositAmount: number;
  billsIncluded: boolean;
  availableFrom: string;
  minimumStay: number;
  maxTenants: number;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  internetIncluded: boolean;
  contractAvailable: boolean;
  houseRules: string[];
  amenities: string[];
  images: ListingImage[];
  status: ListingStatus;
  rejectionReason?: string;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ListingSortBy = "recent" | "priceAsc" | "priceDesc";

export interface SearchFilters {
  keyword?: string;
  city?: string;
  nearbyUniversity?: string;
  minPrice?: number;
  maxPrice?: number;
  types?: PropertyType[];
  internet?: boolean;
  furnished?: boolean;
  billsIncluded?: boolean;
  contractAvailable?: boolean;
  bedrooms?: number;
  maxDistance?: number;
  availableFrom?: string;
  sortBy?: ListingSortBy;
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  room: "Quarto",
  apartment: "Apartamento",
  studio: "Studio",
  shared_house: "Casa partilhada"
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  suspended: "Suspenso"
};

export interface Conversation {
  id: string;
  listingId: string;
  studentId: string;
  landlordId: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationSummary {
  conversation: Conversation;
  listing: Pick<Listing, "id" | "title" | "city" | "monthlyPrice" | "status" | "images"> | null;
  otherParticipant: Pick<User, "id" | "name" | "avatarUrl" | "role"> | null;
  unreadCount: number;
  lastMessage: Message | null;
}

export type ReportReason =
  | "fake_listing"
  | "suspicious_price"
  | "wrong_information"
  | "inappropriate_behavior"
  | "scam_attempt"
  | "other";

export type ReportStatus = "open" | "reviewed" | "actioned" | "dismissed";

export interface Report {
  id: string;
  reporterId: string;
  listingId?: string;
  reportedUserId?: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReportListItem {
  report: Report;
  reporter: User | null;
  listing: { id: string; title: string; city: string; status: string; landlordId: string } | null;
  reportedUser: User | null;
}

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  fake_listing: "Anúncio falso",
  suspicious_price: "Preço suspeito",
  wrong_information: "Informação errada",
  inappropriate_behavior: "Comportamento inapropriado",
  scam_attempt: "Tentativa de burla",
  other: "Outro"
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  open: "Aberta",
  reviewed: "Revista",
  actioned: "Acionada",
  dismissed: "Descartada"
};
