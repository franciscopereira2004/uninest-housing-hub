import type { Listing } from "@/types";
import room1 from "@/assets/room-1.jpg";
import room2 from "@/assets/room-2.jpg";
import room3 from "@/assets/room-3.jpg";
import room4 from "@/assets/room-4.jpg";

const now = "2026-01-01T00:00:00Z";

const ALL_PHOTOS = [room1, room2, room3, room4];

function photos(start: number): { url: string; order: number }[] {
  return [0, 1, 2].map((i) => ({
    url: ALL_PHOTOS[(start + i) % ALL_PHOTOS.length],
    order: i
  }));
}

export const seedListings: Listing[] = [
  {
    id: "l-1",
    landlordId: "u-landlord-1",
    title: "Quarto mobilado perto da Universidade de Coimbra",
    description:
      "Quarto com secretária e varanda, num apartamento partilhado por estudantes. Despesas incluídas e wifi de alta velocidade.",
    propertyType: "room",
    city: "Coimbra",
    address: "Rua Padre António Vieira 12",
    nearbyUniversity: "Universidade de Coimbra",
    distanceToUniversity: 0.8,
    monthlyPrice: 350,
    depositAmount: 350,
    billsIncluded: true,
    availableFrom: "2026-09-01",
    minimumStay: 9,
    maxTenants: 1,
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
    internetIncluded: true,
    contractAvailable: true,
    houseRules: ["Sem fumar", "Silêncio depois das 22h"],
    amenities: ["Aquecimento central", "Máquina de lavar", "Cozinha equipada"],
    images: photos(0),
    status: "approved",
    viewsCount: 0,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "l-2",
    landlordId: "u-landlord-1",
    title: "Studio moderno no centro do Porto",
    description: "Studio totalmente equipado para uma pessoa, com kitchenette moderna e casa de banho privada.",
    propertyType: "studio",
    city: "Porto",
    address: "Rua das Flores 84",
    nearbyUniversity: "Universidade do Porto",
    distanceToUniversity: 0.5,
    monthlyPrice: 620,
    depositAmount: 620,
    billsIncluded: false,
    availableFrom: "2026-08-15",
    minimumStay: 6,
    maxTenants: 1,
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
    internetIncluded: true,
    contractAvailable: true,
    houseRules: ["Sem animais"],
    amenities: ["Ar condicionado", "Máquina de lavar"],
    images: photos(1),
    status: "approved",
    viewsCount: 0,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "l-3",
    landlordId: "u-landlord-1",
    title: "Quarto em moradia partilhada em Lisboa",
    description: "Casa partilhada por 4 estudantes, ambiente calmo e zonas comuns amplas.",
    propertyType: "shared_house",
    city: "Lisboa",
    address: "Avenida da Igreja 200",
    nearbyUniversity: "Universidade de Lisboa",
    distanceToUniversity: 1.2,
    monthlyPrice: 480,
    depositAmount: 480,
    billsIncluded: true,
    availableFrom: "2026-07-01",
    minimumStay: 9,
    maxTenants: 4,
    bedrooms: 4,
    bathrooms: 2,
    furnished: true,
    internetIncluded: false,
    contractAvailable: false,
    houseRules: ["Sem fumar"],
    amenities: ["Jardim", "Sala de estudo"],
    images: photos(2),
    status: "approved",
    viewsCount: 0,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "l-4",
    landlordId: "u-landlord-1",
    title: "Quarto luminoso com vista para o rio",
    description: "Quarto amplo num T3, cozinha partilhada e zona de estudo. Vista para o Mondego.",
    propertyType: "room",
    city: "Coimbra",
    address: "Rua do Mondego 5",
    nearbyUniversity: "Universidade de Coimbra",
    distanceToUniversity: 1.5,
    monthlyPrice: 295,
    depositAmount: 295,
    billsIncluded: true,
    availableFrom: "2026-09-15",
    minimumStay: 9,
    maxTenants: 1,
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
    internetIncluded: true,
    contractAvailable: true,
    houseRules: [],
    amenities: ["Vista rio", "Aquecimento"],
    images: photos(3),
    status: "approved",
    viewsCount: 0,
    createdAt: now,
    updatedAt: now
  }
];
