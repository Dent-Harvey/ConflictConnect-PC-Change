import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { User, UserRole, AuthContextType, LocationData, UserProfile } from '@/types/auth';
import { errorHandler } from '@/utils/errorHandler';
import { sendVerificationEmail, generateVerificationCode } from '@/services/backendEmailService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@crisis_compass_auth';
const LOCATION_STORAGE_KEY = '@crisis_compass_location';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState<{ email: string; role: UserRole } | null>(null);

  // Load user from storage on app start
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      }
    } catch (error) {
      errorHandler({
        filePath: 'contexts/AuthContext.tsx',
        functionName: 'loadStoredUser',
        error: error as Error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (role: UserRole, email?: string, password?: string) => {
    try {
      setIsLoading(true);

      // Handle conflict controller authentication
      if (role === 'conflict_controller') {
        if (password !== 'mutual aid') {
          throw new Error('Invalid password for conflict controller access');
        }
        
        // Create user immediately for conflict controller (no email verification needed)
        const newUser: User = {
          id: `user_${Date.now()}`,
          email: undefined,
          role,
          location: undefined,
          isLocationVerified: false,
          isEmailVerified: true, // Not applicable for conflict controller
          profile: undefined,
          hasCompletedProfile: true, // Not required for conflict controller
          createdAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
        setUser(newUser);
        return;
      }

      // Handle scanner role (no email verification needed)
      if (role === 'scanner') {
        const newUser: User = {
          id: `user_${Date.now()}`,
          email: undefined,
          role,
          location: undefined,
          isLocationVerified: false,
          isEmailVerified: true, // Not applicable for scanner
          profile: undefined,
          hasCompletedProfile: true, // Not required for scanner
          createdAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
        setUser(newUser);
        return;
      }

      // For OTG and Hand roles, require email and start verification process
      if (role === 'otg' || role === 'hand') {
        if (!email) {
          throw new Error('Email is required for OTG and Hand roles');
        }

        // Set pending verification state (this will trigger the email verification screen)
        setPendingVerification({ email, role });
        
        // Don't create user yet - wait for email verification
        return;
      }

    } catch (error) {
      errorHandler({
        filePath: 'contexts/AuthContext.tsx',
        functionName: 'login',
        error: error as Error
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, LOCATION_STORAGE_KEY]);
      setUser(null);
      setPendingVerification(null);
    } catch (error) {
      errorHandler({
        filePath: 'contexts/AuthContext.tsx',
        functionName: 'logout',
        error: error as Error
      });
    }
  };

  const sendVerificationCode = async (email: string): Promise<string> => {
    try {
      console.log('[AUTH] Sending verification code to:', email);
      const code = generateVerificationCode();
      const result = await sendVerificationEmail(email, code);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return code;
    } catch (error) {
      errorHandler({
        filePath: 'contexts/AuthContext.tsx',
        functionName: 'sendVerificationCode',
        error: error as Error
      });
      throw error;
    }
  };

  const verifyEmailCode = async (code: string, expectedCode: string): Promise<void> => {
    try {
      console.log('[AUTH] Verifying email code...');
      
      if (code !== expectedCode) {
        throw new Error('Invalid verification code. Please check and try again.');
      }

      if (!pendingVerification) {
        throw new Error('No pending verification found');
      }

      // Create user after successful email verification
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: pendingVerification.email,
        role: pendingVerification.role,
        location: undefined,
        isLocationVerified: false,
        isEmailVerified: true,
        profile: undefined,
        hasCompletedProfile: false,
        createdAt: new Date().toISOString(),
      };

      // Get location for OTG and Hand roles
      if (newUser.role === 'otg' || newUser.role === 'hand') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Location permission is required for this role');
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        newUser.location = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: address[0] ? `${address[0].city}, ${address[0].region}` : undefined,
        };
        
        // Store location data separately for verification
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: newUser.location.address,
          timestamp: Date.now(),
        };
        
        await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
        newUser.isLocationVerified = true;
      }

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      setPendingVerification(null);
      
      console.log('[AUTH] Email verification successful, user created');
    } catch (error) {
      errorHandler({
        filePath: 'contexts/AuthContext.tsx',
        functionName: 'verifyEmailCode',
        error: error as Error
      });
      throw error;
    }
  };

  const updateProfile = async (profile: UserProfile): Promise<void> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updatedUser: User = {
        ...user,
        profile,
        hasCompletedProfile: true,
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      console.log('[AUTH] Profile updated successfully');
    } catch (error) {
      errorHandler({
        filePath: 'contexts/AuthContext.tsx',
        functionName: 'updateProfile',
        error: error as Error
      });
      throw error;
    }
  };

  const skipProfile = async (): Promise<void> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updatedUser: User = {
        ...user,
        hasCompletedProfile: true, // Mark as completed even though skipped
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      console.log('[AUTH] Profile setup skipped');
    } catch (error) {
      errorHandler({
        filePath: 'contexts/AuthContext.tsx',
        functionName: 'skipProfile',
        error: error as Error
      });
      throw error;
    }
  };

  const resetVerification = () => {
    setPendingVerification(null);
  };

  const updateLocation = async (location: { latitude: number; longitude: number; address?: string }) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updatedUser: User = {
        ...user,
        location,
        isLocationVerified: true,
      };

      const locationData: LocationData = {
        ...location,
        timestamp: Date.now(),
      };

      await AsyncStorage.multiSet([
        [AUTH_STORAGE_KEY, JSON.stringify(updatedUser)],
        [LOCATION_STORAGE_KEY, JSON.stringify(locationData)]
      ]);

      setUser(updatedUser);
    } catch (error) {
      errorHandler({
        filePath: 'contexts/AuthContext.tsx',
        functionName: 'updateLocation',
        error: error as Error
      });
      throw error;
    }
  };

  const verifyLocation = async (): Promise<boolean> => {
    try {
      if (!user || user.role === 'scanner' || user.role === 'conflict_controller') {
        return true; // Scanner and conflict controller don't need location verification
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return false;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const storedLocationData = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (!storedLocationData) {
        return false;
      }

      const storedLocation: LocationData = JSON.parse(storedLocationData);
      
      // Calculate distance between current and stored location
      const distance = getDistanceFromLatLonInKm(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        storedLocation.latitude,
        storedLocation.longitude
      );

      // Allow up to 10km difference for location verification
      return distance <= 10;
    } catch (error) {
      errorHandler({
        filePath: 'contexts/AuthContext.tsx',
        functionName: 'verifyLocation',
        error: error as Error
      });
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    pendingVerification,
    login,
    logout,
    updateLocation,
    verifyLocation,
    sendVerificationCode,
    verifyEmailCode,
    updateProfile,
    skipProfile,
    resetVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to calculate distance between two coordinates
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}