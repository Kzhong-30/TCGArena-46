import type {
  User,
  Property,
  Booking,
  Message,
  Review,
  Complaint,
  Favorite,
  UserRole,
  PropertyStatus,
  PropertyType,
  ListingStatus,
  BookingStatus,
  MessageStatus,
  ComplaintStatus,
  RentPeriod,
} from "@prisma/client";

export type {
  User,
  Property,
  Booking,
  Message,
  Review,
  Complaint,
  Favorite,
  UserRole,
  PropertyStatus,
  PropertyType,
  ListingStatus,
  BookingStatus,
  MessageStatus,
  ComplaintStatus,
  RentPeriod,
};

export interface PropertyWithDetails extends Property {
  landlord: User;
  reviews: Review[];
  _count?: {
    bookings: number;
    reviews: number;
    favorites: number;
  };
}

export interface BookingWithDetails extends Booking {
  property: Property;
  tenant: User;
  landlord: User;
}

export interface MessageWithDetails extends Message {
  sender: User;
  receiver: User;
  property?: Property;
}

export interface ReviewWithDetails extends Review {
  property: Property;
  tenant: User;
}

export interface ComplaintWithDetails extends Complaint {
  property?: Property;
  complainant: User;
  respondent?: User;
  handler?: User;
}

export interface PropertyFilters {
  query?: string;
  city?: string;
  district?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  orientation?: string;
  furnished?: boolean;
  hasParking?: boolean;
  hasElevator?: boolean;
  hasBalcony?: boolean;
  hasGarden?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  rentPeriod?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  phone?: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  rentPeriod: RentPeriod;
  deposit?: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  totalFloors?: number;
  orientation?: string;
  type: PropertyType;
  furnished: boolean;
  hasParking: boolean;
  hasElevator: boolean;
  hasBalcony: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  hasGym: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  address: string;
  city: string;
  district: string;
  province: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  availableFrom?: Date;
  minimumStay?: number;
  maximumStay?: number;
}

export interface BookingFormData {
  propertyId: string;
  preferredDate: Date;
  preferredTime: string;
  alternateDate?: Date;
  alternateTime?: string;
  message?: string;
  numberOfPeople?: number;
}

export interface MessageFormData {
  receiverId: string;
  propertyId?: string;
  content: string;
}

export interface ReviewFormData {
  propertyId: string;
  rating: number;
  cleanliness?: number;
  location?: number;
  communication?: number;
  value?: number;
  comment?: string;
}

export interface ComplaintFormData {
  title: string;
  description: string;
  type: string;
  propertyId?: string;
  respondentId?: string;
  priority?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage?: Message;
  unreadCount: number;
  property?: Property;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: "location" | "property" | "landlord";
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  property: Property;
}
