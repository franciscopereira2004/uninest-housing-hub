import type { ListingEntity, UserEntity } from "../types/models.js";

const now = new Date().toISOString();

export const seedUsers: UserEntity[] = [];

export const seedListings: ListingEntity[] = [
  {
    id: "l-1",
    propertyId: "p-1",
    roomId: "r-1",
    title: "Quarto mobilado perto da universidade",
    description: "Quarto com secretária e varanda, despesas incluídas.",
    city: "Coimbra",
    price: 350,
    coverImage: "/src/assets/room-1.jpg",
    availableFrom: "2026-09-01",
    status: "active",
    propertyType: "apartment",
    internetIncluded: true,
    furnished: true,
    privateBathroom: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "l-2",
    propertyId: "p-2",
    roomId: "r-2",
    title: "Studio moderno no centro",
    description: "Studio para 1 pessoa com kitchenette equipada.",
    city: "Porto",
    price: 620,
    coverImage: "/src/assets/room-2.jpg",
    availableFrom: "2026-08-15",
    status: "active",
    propertyType: "studio",
    internetIncluded: true,
    furnished: true,
    privateBathroom: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "l-3",
    propertyId: "p-3",
    roomId: "r-3",
    title: "Quarto em moradia partilhada",
    description: "Ambiente calmo, perto de transportes e comércio.",
    city: "Lisboa",
    price: 480,
    coverImage: "/src/assets/room-3.jpg",
    availableFrom: "2026-07-01",
    status: "active",
    propertyType: "house",
    internetIncluded: false,
    furnished: true,
    privateBathroom: false,
    createdAt: now,
    updatedAt: now
  }
];
