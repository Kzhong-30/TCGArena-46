export const FULL_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  password: true,
  image: true,
  emailVerified: true,
  phone: true,
  role: true,
  isActive: true,
  bio: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const PROPERTY_SELECT = {
  id: true,
  title: true,
  description: true,
  price: true,
  rentPeriod: true,
  deposit: true,
  area: true,
  bedrooms: true,
  bathrooms: true,
  floor: true,
  totalFloors: true,
  orientation: true,
  type: true,
  furnished: true,
  hasParking: true,
  hasElevator: true,
  hasBalcony: true,
  hasGarden: true,
  hasPool: true,
  hasGym: true,
  petsAllowed: true,
  smokingAllowed: true,
  address: true,
  city: true,
  district: true,
  province: true,
  zipCode: true,
  latitude: true,
  longitude: true,
  images: true,
  videoUrl: true,
  virtualTourUrl: true,
  status: true,
  listingStatus: true,
  isFeatured: true,
  availableFrom: true,
  minimumStay: true,
  maximumStay: true,
  landlordId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const parsePropertyImages = <T extends { images: string }>(
  property: T
): Omit<T, 'images'> & { images: string[] } => {
  return {
    ...property,
    images: JSON.parse(property.images) as string[],
  };
};

export const parsePropertiesImages = <T extends { images: string }>(
  properties: T[]
): Array<Omit<T, 'images'> & { images: string[] }> => {
  return properties.map(parsePropertyImages);
};

export const stringifyImages = (images: string[]): string => {
  return JSON.stringify(images);
};
