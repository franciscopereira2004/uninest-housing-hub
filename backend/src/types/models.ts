export type UserRole = "student" | "landlord" | "admin";

export interface UserEntity {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export type UserPublic = Omit<UserEntity, "passwordHash">;

export interface ListingEntity {
  id: string;
  propertyId: string;
  roomId: string;
  title: string;
  description: string;
  city: string;
  price: number;
  coverImage: string;
  availableFrom: string;
  status: "active" | "paused" | "closed";
  propertyType: "apartment" | "house" | "studio";
  internetIncluded: boolean;
  furnished: boolean;
  privateBathroom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: ListingEntity["propertyType"] | "any";
  internet?: boolean;
  furnished?: boolean;
  privateBathroom?: boolean;
  availableFrom?: string;
}
