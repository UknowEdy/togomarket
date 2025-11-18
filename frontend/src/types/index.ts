// Types utilisateur
export interface User {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  district?: string;
  avatar?: {
    url: string;
    publicId: string;
  };
  bio?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  totalListings: number;
  activeListings: number;
  rating: {
    average: number;
    count: number;
  };
  badges: string[];
  isPremium: boolean;
  memberSince: string;
  isFullyVerified?: boolean;
}

// Types annonce
export interface Listing {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  isNegotiable: boolean;
  isFree: boolean;
  condition: 'new' | 'excellent' | 'good' | 'acceptable';
  images: {
    url: string;
    publicId: string;
    isPrimary: boolean;
  }[];
  location: {
    city: string;
    district?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  seller: User;
  contactInfo?: {
    phone: string;
    whatsapp?: string;
    showPhoneDirectly: boolean;
  };
  isUrgent: boolean;
  isFeatured: boolean;
  isTopAd: boolean;
  views: number;
  contactClicks: number;
  favorites: number;
  status: 'pending' | 'active' | 'sold' | 'expired' | 'rejected' | 'deleted';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  primaryImage?: {
    url: string;
    publicId: string;
  };
  daysRemaining?: number;
}

// Types catégorie
export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

// Types ville
export interface City {
  name: string;
  region: string;
}

// Types formulaire
export interface RegisterData {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  city: string;
}

export interface LoginData {
  phoneOrEmail: string;
  password: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  isNegotiable: boolean;
  isFree: boolean;
  condition: string;
  city: string;
  district?: string;
  isUrgent: boolean;
  images: FileList | File[];
}

// Types API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: User;
  listing?: Listing;
  listings?: Listing[];
  categories?: Category[];
  cities?: City[];
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

// Types filtres
export interface ListingFilters {
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
