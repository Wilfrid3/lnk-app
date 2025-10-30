// src/types/User.ts

export interface ServicePackage {
  id?: string; // For backward compatibility
  _id?: string; // MongoDB ObjectId from API
  title: string;
  services: string[];
  price: number;
  currency: string;
  duration?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  phoneNumber?: string;
  countryCode?: string;
  isPhoneVerified?: boolean;
  email?: string;
  name?: string;
  userType?: 'homme' | 'femme' | 'couple' | 'autres';
  age?: number;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  isActive?: boolean;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  authType?: 'phone' | 'email' | 'google';
  createdAt?: string;
  updatedAt?: string;
  acceptedTermsAndPrivacy?: boolean;
  lastLogin?: string;
  lastSeen?: string;
  isOnline?: boolean;
  isVip?: boolean;
  isAdmin?: boolean;
  // Preferences and rates fields
  clientType?: string;
  appearance?: string;
  offerings?: string[];
  hourlyRate?: number;
  halfDayRate?: number;
  fullDayRate?: number;
  weekendRate?: number;
  availabilityHours?: string;
  specialServices?: string;
  paymentMethods?: string[];
  additionalNotes?: string;
  // Service packages
  servicePackages?: ServicePackage[];
  // Engagement fields
  followers?: string[]; // Array of user IDs following this user
  following?: string[]; // Array of user IDs this user follows
  profileViews?: number; // Total profile views
  averageRating?: number; // Average rating (1-5)
  totalRatings?: number; // Sum of all ratings
  ratingCount?: number; // Number of ratings received
  currentRank?: number; // Current ranking position
  rankHistory?: { // Historical rankings
    week: number;
    month: number;
    year: number;
  };
  inviteCode?: string; // Unique invite code for the user
  inviteCodeUsedBy?: string[]; // Array of user IDs who used this invite code
  inviteCodeCreatedAt?: string; // Timestamp when the invite code was created
  // Invite system fields
  invitedBy?: string | User;
  inviteRewards?: number;
}

// Additional types for authentication and user state management
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  phoneNumber?: string;
  email?: string;
  password?: string;
  code?: string; // For phone verification login
}

export interface RegisterData {
  phoneNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  password?: string;
}

export interface VerificationData {
  phoneNumber: string;
  code: string;
}
