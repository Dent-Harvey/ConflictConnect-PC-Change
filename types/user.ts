export interface UserLocation {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface SocialLinks {
  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  github?: string;
  youtube?: string;
  tiktok?: string;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  conflictUpdates: boolean;
  resourceMatches: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'contacts';
  locationSharing: boolean;
  activityStatus: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface VerificationStatus {
  email: boolean;
  phone: boolean;
  identity: boolean;
  location: boolean;
}

export type UserRole = 'user' | 'otg' | 'hand' | 'admin' | 'moderator';

export interface User {
  id: string; // Firebase UID
  email: string;
  username: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  location?: UserLocation;
  socialLinks?: SocialLinks;
  preferences: UserPreferences;
  verificationStatus: VerificationStatus;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  isActive: boolean;
}

export interface CreateUserData {
  email: string;
  username: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserData extends Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> {
  updatedAt?: string;
}

export interface UserProfile extends User {
  // Extended profile data for display purposes
  fullName?: string;
  initials?: string;
  isOnline?: boolean;
}