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

export interface UserEntity {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  passwordHash: string;
  isBlocked: boolean;
  studentProfile?: StudentProfile;
  landlordProfile?: LandlordProfile;
  createdAt: string;
  updatedAt: string;
}

export type UserPublic = Omit<UserEntity, "passwordHash">;

export type PropertyType = "room" | "apartment" | "studio" | "shared_house";

export type ListingStatus = "pending" | "approved" | "rejected" | "suspended";

export interface ListingImage {
  url: string;
  publicId?: string;
  order: number;
}

export interface ListingEntity {
  id: string;
  landlordId: string;
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

export interface ListingFilters {
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

export interface FavouriteEntity {
  id: string;
  studentId: string;
  listingId: string;
  createdAt: string;
}

export interface ConversationEntity {
  id: string;
  listingId: string;
  studentId: string;
  landlordId: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageEntity {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export type ReportReason =
  | "fake_listing"
  | "suspicious_price"
  | "wrong_information"
  | "inappropriate_behavior"
  | "scam_attempt"
  | "other";

export type ReportStatus = "open" | "reviewed" | "actioned" | "dismissed";

export interface ReportEntity {
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
