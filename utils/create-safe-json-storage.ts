import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { createJSONStorage } from "zustand/middleware";

// Create a safe storage that only works in React Native environment
export const createSafeJSONStorage = () => {
  // Check if we're running in a React Native environment
  if (typeof AsyncStorage !== "undefined" && Platform.OS !== "web") {
    return createJSONStorage(() => AsyncStorage);
  }

  // Fallback for web/SSR environments
  return createJSONStorage(() => ({
    getItem: async (key: string) => {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    },
    setItem: async (key: string, value: string) => {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    },
    removeItem: async (key: string) => {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    },
  }));
};
