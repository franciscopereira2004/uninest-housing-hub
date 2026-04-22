import type { Listing, Property, Room, User } from "@/types";
import room1 from "@/assets/room-1.jpg";
import room2 from "@/assets/room-2.jpg";
import room3 from "@/assets/room-3.jpg";
import room4 from "@/assets/room-4.jpg";

export const seedUsers: User[] = [];

export const seedProperties: Property[] = [
  {
    id: "p-1",
    landlordId: "u-landlord-1",
    title: "Apartamento luminoso na Baixa do Porto",
    description:
      "Apartamento renovado a 5 minutos da Universidade do Porto. Cozinha equipada, sala comum espaçosa e ótima exposição solar.",
    address: "Rua das Flores 120",
    city: "Porto",
    postalCode: "4050-262",
    country: "Portugal",
    type: "apartment",
    bathrooms: 2,
    roomsCount: 3,
    sharedKitchen: true,
    sharedBathroom: false,
    internetIncluded: true,
    rules: ["Sem fumar", "Sem festas", "Sem animais"],
    images: [room1, room2],
    createdAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "p-2",
    landlordId: "u-landlord-1",
    title: "Studio moderno com vista de cidade — Lisboa",
    description:
      "Studio totalmente mobilado em Campo de Ourique, perfeito para estudantes que procuram independência.",
    address: "Rua Ferreira Borges 45",
    city: "Lisboa",
    postalCode: "1350-150",
    country: "Portugal",
    type: "studio",
    bathrooms: 1,
    roomsCount: 1,
    sharedKitchen: false,
    sharedBathroom: false,
    internetIncluded: true,
    rules: ["Sem fumar"],
    images: [room3],
    createdAt: "2025-02-05T10:00:00Z",
  },
  {
    id: "p-3",
    landlordId: "u-landlord-1",
    title: "Quarto acolhedor em casa de família — Coimbra",
    description:
      "Casa tradicional remodelada com quartos individuais, jardim e ambiente tranquilo perto da universidade.",
    address: "Travessa do Loureiro 8",
    city: "Coimbra",
    postalCode: "3000-100",
    country: "Portugal",
    type: "house",
    bathrooms: 2,
    roomsCount: 4,
    sharedKitchen: true,
    sharedBathroom: true,
    internetIncluded: true,
    rules: ["Silêncio depois das 22h"],
    images: [room4, room1],
    createdAt: "2025-03-01T10:00:00Z",
  },
];

export const seedRooms: Room[] = [
  {
    id: "r-1",
    propertyId: "p-1",
    name: "Quarto Sul",
    description: "Quarto individual com varanda e secretária ampla.",
    price: 380,
    deposit: 380,
    privateBathroom: false,
    furnished: true,
    availableFrom: "2025-09-01",
    status: "available",
    features: ["Cama individual", "Roupeiro", "Aquecimento"],
  },
  {
    id: "r-2",
    propertyId: "p-1",
    name: "Quarto Norte",
    description: "Quarto duplo, ideal para estudante com visitas frequentes.",
    price: 450,
    deposit: 450,
    privateBathroom: true,
    furnished: true,
    availableFrom: "2025-10-01",
    status: "available",
    features: ["Cama de casal", "Casa de banho privada", "Secretária"],
  },
  {
    id: "r-3",
    propertyId: "p-2",
    name: "Studio completo",
    description: "Studio mobilado, kitchenette e zona de estudo integrada.",
    price: 720,
    deposit: 720,
    privateBathroom: true,
    furnished: true,
    availableFrom: "2025-08-15",
    status: "available",
    features: ["Kitchenette", "Casa de banho privada", "Vista cidade"],
  },
  {
    id: "r-4",
    propertyId: "p-3",
    name: "Quarto Loureiro 1",
    description: "Quarto com janela para o jardim, muito tranquilo.",
    price: 290,
    deposit: 290,
    privateBathroom: false,
    furnished: true,
    availableFrom: "2025-09-10",
    status: "available",
    features: ["Janela jardim", "Roupeiro", "Estante"],
  },
  {
    id: "r-5",
    propertyId: "p-3",
    name: "Quarto Loureiro 2",
    description: "Quarto amplo no piso superior.",
    price: 320,
    deposit: 320,
    privateBathroom: true,
    furnished: true,
    availableFrom: "2025-09-10",
    status: "available",
    features: ["Casa de banho privada", "Cama individual", "Secretária"],
  },
];

export const seedListings: Listing[] = seedRooms.map((room) => {
  const property = seedProperties.find((p) => p.id === room.propertyId)!;
  return {
    id: `l-${room.id}`,
    propertyId: property.id,
    roomId: room.id,
    title: `${room.name} — ${property.city}`,
    description: room.description,
    city: property.city,
    price: room.price,
    coverImage: property.images[0],
    availableFrom: room.availableFrom,
    status: "active",
  };
});
