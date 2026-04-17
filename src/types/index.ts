export type UserRole = "student" | "landlord" | "admin";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  type: "apartment" | "house" | "studio";
  bathrooms: number;
  roomsCount: number;
  sharedKitchen: boolean;
  sharedBathroom: boolean;
  internetIncluded: boolean;
  rules: string[];
  images: string[];
  createdAt: string;
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  price: number;
  deposit: number;
  privateBathroom: boolean;
  furnished: boolean;
  availableFrom: string;
  status: "available" | "reserved" | "occupied";
  features: string[];
}

export interface Listing {
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
}

export interface SearchFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: Property["type"] | "any";
  internet?: boolean;
  furnished?: boolean;
  privateBathroom?: boolean;
  availableFrom?: string;
}
