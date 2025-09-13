export type UserRole = 'scanner' | 'otg' | 'hand' | 'conflict_controller';

export interface UserProfile {
  firstName: string;
  lastName: string;
  // Note: email and location are stored in the User object, not in profile
  organization?: string;
  phoneNumber?: string;
  bio?: string;
  expertise?: string[];
  availability?: 'full_time' | 'part_time' | 'weekends' | 'emergency_only';
}

export interface User {
  id: string;
  email?: string;
  role: UserRole;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  isLocationVerified: boolean;
  isEmailVerified: boolean;
  profile?: UserProfile;
  hasCompletedProfile: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingVerification: { email: string; role: UserRole } | null;
  login: (role: UserRole, email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateLocation: (location: { latitude: number; longitude: number; address?: string }) => Promise<void>;
  verifyLocation: () => Promise<boolean>;
  sendVerificationCode: (email: string) => Promise<string>;
  verifyEmailCode: (code: string, expectedCode: string) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  skipProfile: () => Promise<void>;
  resetVerification: () => void;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
}