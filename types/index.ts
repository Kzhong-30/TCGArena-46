export type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';

export type PropertyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RENTED';

export type PropertyType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'VILLA'
  | 'STUDIO'
  | 'LOFT'
  | 'DORMITORY'
  | 'OFFICE'
  | 'COMMERCIAL';

export type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'SOLD';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'RESCHEDULED';

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type RentPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'DAILY';

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  password: string | null;
  image: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  rentPeriod: RentPeriod;
  deposit: number | null;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor: number | null;
  totalFloors: number | null;
  orientation: string | null;
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
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  // 在数据库中存储为 JSON 字符串
  images: string[];
  videoUrl: string | null;
  virtualTourUrl: string | null;
  status: PropertyStatus;
  listingStatus: ListingStatus;
  isFeatured: boolean;
  availableFrom: Date | null;
  minimumStay: number | null;
  maximumStay: number | null;
  landlordId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  preferredDate: Date;
  preferredTime: string;
  alternateDate: Date | null;
  alternateTime: string | null;
  message: string | null;
  numberOfPeople: number | null;
  status: BookingStatus;
  rejectionReason: string | null;
  rescheduleNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId: string | null;
  content: string;
  status: MessageStatus;
  isRead: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  propertyId: string;
  tenantId: string;
  rating: number;
  cleanliness: number | null;
  location: number | null;
  communication: number | null;
  value: number | null;
  comment: string | null;
  createdAt: Date;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  type: string;
  propertyId: string | null;
  complainantId: string;
  respondentId: string | null;
  handlerId: string | null;
  status: ComplaintStatus;
  priority: string | null;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: Date;
}

export interface PropertyWithDetails extends Property {
  landlord: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
    createdAt: Date;
    email: string;
    phone: string | null;
    bio: string | null;
  };
  reviews: ReviewWithTenant[];
  _count?: {
    bookings: number;
    reviews: number;
    favorites: number;
  };
}

export interface ReviewWithTenant extends Review {
  tenant: {
    id: string;
    image: string | null;
    name: string | null;
  };
}

export interface BookingWithDetails extends Booking {
  property: Property;
  tenant: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
    phone: string | null;
  };
  landlord: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
    phone: string | null;
  };
}

export interface MessageWithDetails extends Message {
  sender: {
    id: string;
    name: string | null;
    image: string | null;
    email?: string;
    phone?: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    image: string | null;
    email?: string;
    phone?: string | null;
  };
  property?: {
    id: string;
    title: string;
    price: number;
    images: string[];
    address?: string;
  };
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
  amenities?: string[];
  facility?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
  availableFrom?: string;
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
  participant: {
    id: string;
    name: string | null;
    image: string | null;
    email?: string;
    phone?: string | null;
  };
  lastMessage?: Message;
  unreadCount: number;
  property?: {
    id: string;
    title: string;
    price: number;
    images: string[];
    address?: string;
  };
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'location' | 'property' | 'landlord';
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  property: Property;
}
