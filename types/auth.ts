export type UserRole = 'civilian' | 'scanner' | 'otg' | 'hand' | 'conflict_controller';

export interface UserProfile {
    // Required fields
  firstName: string;
  lastName: string;
  email: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  
  // Personal information
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | 'other';
  profilePicture?: string;
  
  // Professional information
  organization?: string;
  jobTitle?: string;
  bio?: string;
  expertise?: string[];
  skills?: string[];
  certifications?: string[];
  
  // Availability and preferences
  availability?: 'full_time' | 'part_time' | 'weekends' | 'emergency_only';
  languages?: string[]; // Array of language codes
  preferredLanguage?: string;
  
  // Contact preferences
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Social links
  website?: string;
  linkedin?: string;
  twitter?: string;
  
  // Additional fields for networking
  interests?: string[];
  volunteerExperience?: string[];
  education?: {
    degree: string;
    institution: string;
    year?: number;
  }[];
  
  // Privacy settings
  showLocation?: boolean;
  showContactInfo?: boolean;
  allowMessaging?: boolean;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile?: UserProfile;
  verified: boolean;
  createdAt: Date;
  lastActive: Date;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated?: boolean;
  isLoading: boolean;
  pendingVerification: { email: string; role: UserRole } | null;
  needsProfileSetup: boolean;
  login: (role: UserRole, email?: string, password?: string) => Promise<User | { email: string; verificationCode: string }>;
  verifyEmailAndCreateUser: (email: string, code: string, role?: UserRole) => Promise<any>;
  completeProfileSetup: (profileData: UserProfile) => Promise<User>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<User>;
  logout: () => Promise<void>;
  updateLocation: (location: { latitude: number; longitude: number; address?: string }) => Promise<void>;
  verifyLocation?: () => Promise<boolean>;
  sendVerificationCode?: (email: string) => Promise<string>;
  verifyEmailCode?: (code: string, expectedCode: string) => Promise<void>;
  updateProfile?: (profile: UserProfile) => Promise<void>;
  skipProfile?: () => Promise<void>;
  resetVerification: () => void;
  updateUserRole: (role: UserRole) => Promise<void>;
  getUsersByRole: (role: UserRole, limit?: number) => Promise<UserProfile[]>;
  getUsersByLocation: (latitude: number, longitude: number, radiusKm?: number) => Promise<UserProfile[]>;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
}