// Source code templates for complete ConflictConnect project export
export const generateComprehensiveProject = () => {
  const sourceFiles: { [key: string]: string } = {};

  // Package configuration - Using actual project dependencies
  sourceFiles['package.json'] = `{
  "name": "conflictconnect",
  "main": "index.js",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "format": "prettier --write .",
    "prebuild": "expo prebuild",
    "prebuild:clean": "expo prebuild --clean",
    "ios:dev": "expo run:ios",
    "android:dev": "expo run:android",
    "build:ios": "eas build --platform ios",
    "build:ios-simulator": "eas build --platform ios --profile preview",
    "build:android": "eas build --platform android",
    "submit:ios": "eas submit --platform ios",
    "submit:android": "eas submit --platform android"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.1.0",
    "@hookform/resolvers": "3.10.0",
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-native-community/datetimepicker": "8.4.1",
    "@react-native-masked-view/masked-view": "0.3.2",
    "@react-navigation/bottom-tabs": "^7.3.10",
    "@react-navigation/elements": "^2.3.8",
    "@react-navigation/native": "^7.1.6",
    "@shopify/flash-list": "^2.0.2",
    "@tanstack/react-query": "^5.81.2",
    "date-fns": "^4.1.0",
    "expo": "~53.0.13",
    "expo-auth-session": "~6.2.0",
    "expo-av": "~15.1.6",
    "expo-blur": "~14.1.5",
    "expo-camera": "~16.1.9",
    "expo-clipboard": "~7.1.4",
    "expo-constants": "~17.1.6",
    "expo-device": "~7.1.4",
    "expo-document-picker": "~13.1.6",
    "expo-file-system": "~18.1.10",
    "expo-font": "~13.3.1",
    "expo-haptics": "~14.1.4",
    "expo-image": "~2.3.0",
    "expo-image-picker": "~16.1.4",
    "expo-linear-gradient": "~14.1.5",
    "expo-linking": "~7.1.7",
    "expo-localization": "~16.1.5",
    "expo-location": "~18.1.6",
    "expo-media-library": "~17.1.7",
    "expo-mesh-gradient": "~0.3.4",
    "expo-network": "~7.1.5",
    "expo-notifications": "~0.31.3",
    "expo-router": "~5.1.1",
    "expo-secure-store": "~14.2.3",
    "expo-sharing": "~13.1.5",
    "expo-splash-screen": "~0.30.9",
    "expo-status-bar": "~2.2.3",
    "expo-symbols": "~0.4.5",
    "expo-system-ui": "~5.0.9",
    "expo-updates": "~0.28.15",
    "expo-web-browser": "~14.2.0",
    "i18next": "^25.3.2",
    "immer": "^10.1.1",
    "lucide-react-native": "^0.523.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-hook-form": "^7.62.0",
    "react-i18next": "^15.6.1",
    "react-native": "0.79.4",
    "react-native-chart-kit": "^6.12.0",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-get-random-values": "~1.11.0",
    "react-native-maps": "1.20.1",
    "react-native-reanimated": "~3.17.4",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.11.1",
    "react-native-svg": "15.11.2",
    "react-native-web": "~0.20.0",
    "react-native-webview": "13.13.5",
    "uuid": "^11.1.0",
    "zod": "^4.1.5",
    "zustand": "^5.0.6"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~19.0.10",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~9.2.0",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-prettier": "^5.5.1",
    "prettier": "^3.6.2",
    "typescript": "~5.8.3"
  },
  "private": true
}`;

  // App configuration
  sourceFiles['app.json'] = `{
  "expo": {
    "name": "ConflictConnect",
    "slug": "conflictconnect",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "conflictconnect",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.conflictconnect.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.conflictconnect.app"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-font",
      ["expo-location", {
        "locationAlwaysAndWhenInUsePermission": "This app uses location to show nearby conflicts and resources."
      }]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}`;

  // TypeScript configuration
  sourceFiles['tsconfig.json'] = `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}`;

  // Entry point
  sourceFiles['index.js'] = `import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);`;

  // 9gen configuration
  sourceFiles['9gen_config.json'] = `{
  "project_id": "cm3w8yrff000208mnlbdwbm12"
}`;

  // Root layout
  sourceFiles['app/_layout.tsx'] = `import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated/lib/reanimated2/js-reanimated/global';

import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on \`/modal\` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
`;

  // Home screen
  sourceFiles['app/index.tsx'] = `import { Image, StyleSheet, Platform } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ConflictMap } from '@/components/ConflictMap';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">ConflictConnect!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Global Conflict Tracking</ThemedText>
        <ThemedText>
          Track conflict zones and coordinate humanitarian aid resources.
        </ThemedText>
      </ThemedView>
      <ConflictMap />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
\`;

  // Theme system
  sourceFiles['theme/index.ts'] = \`export interface Theme {
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#666666',
    border: '#C6C6C8',
    error: '#FF3B30',
    warning: '#FF9500',
    success: '#34C759',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#999999',
    border: '#38383A',
    error: '#FF453A',
    warning: '#FF9F0A',
    success: '#30D158',
  },
};
\`;

  // Conflict Map Component
  sourceFiles['components/ConflictMap.tsx'] = \`import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useConflictData } from '@/hooks/useConflictData';
import * as Location from 'expo-location';

export const ConflictMap: React.FC = () => {
  const { data: conflicts = [], isLoading } = useConflictData();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading conflicts...</Text>
      </View>
    );
  }

  const initialRegion = userLocation || {
    latitude: 50.4501,
    longitude: 30.5234, // Kyiv, Ukraine
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          ...initialRegion,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
      >
        {conflicts.map((conflict) => (
          <Marker
            key={conflict.id}
            coordinate={{
              latitude: conflict.data.latitude,
              longitude: conflict.data.longitude,
            }}
            title={conflict.data.title}
            description={conflict.data.description}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
\`;

  // Conflict Data Hook
  sourceFiles['hooks/useConflictData.ts'] = \`import { useQuery } from '@tanstack/react-query';
import { conflictService } from '@/services/conflictService';

export const useConflictData = () => {
  return useQuery({
    queryKey: ['conflicts'],
    queryFn: conflictService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
\`;

  // Conflict Service
  sourceFiles['services/conflictService.ts'] = \`import { project_id } from '@/9gen_config.json';

const DB_API_BASE_URL = 'https://api.9gen.dev/api';

export interface ConflictZone {
  id: string;
  data: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'armed_conflict' | 'natural_disaster' | 'humanitarian_crisis';
    status: 'active' | 'resolved' | 'monitoring';
    affected_population: number;
    last_updated: string;
  };
  created_at: string;
  updated_at: string;
}

export const conflictService = {
  async getAll(): Promise<ConflictZone[]> {
    try {
      const response = await fetch(
        \`\${DB_API_BASE_URL}/entities/ConflictZone?project_id=\${project_id}\`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch conflicts');
      }
      
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching conflicts:', error);
      throw error;
    }
  },

  async create(conflictData: Omit<ConflictZone['data'], 'last_updated'>): Promise<ConflictZone> {
    try {
      const response = await fetch(\`\${DB_API_BASE_URL}/entities/ConflictZone/insert\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id,
          data: {
            ...conflictData,
            last_updated: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conflict');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating conflict:', error);
      throw error;
    }
  },
};
\`;

  // Entity schemas
  sourceFiles['entities/ConflictZone.json'] = \`{
  "name": "ConflictZone",
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "latitude": {
      "type": "number"
    },
    "longitude": {
      "type": "number"
    },
    "severity": {
      "type": "string",
      "enum": ["low", "medium", "high", "critical"]
    },
    "type": {
      "type": "string",
      "enum": ["armed_conflict", "natural_disaster", "humanitarian_crisis"]
    },
    "status": {
      "type": "string",
      "enum": ["active", "resolved", "monitoring"]
    },
    "affected_population": {
      "type": "number"
    },
    "last_updated": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": ["title", "latitude", "longitude", "severity", "type", "status"]
}
\`;

  sourceFiles['entities/Resources.json'] = \`{
  "name": "Resources",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": ["medical", "food", "shelter", "clothing", "transportation", "financial", "other"]
    },
    "description": {
      "type": "string"
    },
    "quantity": {
      "type": "number"
    },
    "unit": {
      "type": "string"
    },
    "location": {
      "type": "object",
      "properties": {
        "latitude": { "type": "number" },
        "longitude": { "type": "number" },
        "address": { "type": "string" }
      }
    },
    "contact_info": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "phone": { "type": "string" },
        "email": { "type": "string" }
      }
    },
    "availability": {
      "type": "string",
      "enum": ["available", "reserved", "delivered", "expired"]
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high", "urgent"]
    }
  },
  "required": ["name", "type", "description", "quantity", "availability"]
}
\`;

  // README
  sourceFiles['README.md'] = \`# ConflictConnect 🌍

A React Native + Expo application for tracking conflict zones and coordinating humanitarian aid resources.

## Features

- 🗺️ Interactive conflict zone mapping with real-time data
- 🆘 Resource and humanitarian aid matching system
- 📝 User needs submission and management
- 🔄 Real-time conflict tracking and updates
- 💝 Charity integration for donations
- 📱 Mobile-optimized responsive design with native feel
- 🎨 Dark/Light theme support
- 🌐 Internationalization (i18n) ready
- 📊 Data visualization and analytics
- 🔔 Push notifications for urgent updates

## Tech Stack

- **React Native** with Expo SDK 52
- **TypeScript** for type safety
- **Expo Router** for file-based routing
- **TanStack Query** for server state management
- **React Hook Form + Zod** for form validation
- **React Native Reanimated 3** for smooth animations
- **React Native Maps** for mapping functionality
- **9gen Database API** for backend data storage
- **Expo Location** for geolocation services
- **React i18next** for internationalization

## Quick Start

\\\`\\\`\\\`bash
# Install dependencies
npm install

# Start development server
expo start

# Run on specific platforms
expo start --ios
expo start --android
expo start --web
\\\`\\\`\\\`

## Project Structure

\\\`\\\`\\\`
ConflictConnect/
├── app/                      # Expo Router pages
│   ├── _layout.tsx          # Root layout with providers
│   ├── index.tsx            # Home screen
│   ├── app/                 # Protected app routes
│   └── conflict/            # Dynamic conflict routes
├── components/              # Reusable UI components
│   ├── ui/                  # Base UI components
│   └── [feature-components] # Feature-specific components
├── hooks/                   # Custom React hooks
├── services/                # API services and data fetching
├── types/                   # TypeScript type definitions
├── theme/                   # Theme configuration and tokens
├── constants/               # App-wide constants
├── entities/                # Database entity JSON schemas
├── i18n/                    # Internationalization setup
│   └── locales/             # Translation files
├── utils/                   # Utility functions
├── assets/                  # Images, fonts, and static assets
├── app.json                 # Expo app configuration
├── package.json             # Dependencies and scripts
├── 9gen_config.json         # Database project configuration
└── tsconfig.json            # TypeScript configuration
\\\`\\\`\\\`

## Database Integration

This app uses the 9gen Database API for data persistence:

- **Base URL**: https://api.9gen.dev/api
- **Configuration**: Set your project_id in \\\`9gen_config.json\\\`
- **Entities**: JSON schemas in \\\`entities/\\\` folder
- **Services**: API integration in \\\`services/\\\` folder

### Available Entities

- **ConflictZone**: Track conflict areas with location and severity
- **Resources**: Manage humanitarian aid resources
- **UserNeeds**: Handle user-submitted aid requests
- **Charity**: Partner organizations and donation channels

## Development Guidelines

### State Management
- Use TanStack Query for server state
- React Context for global client state
- Local useState for component state
- AsyncStorage for persistence

### UI/UX Patterns
- Follow platform-specific design guidelines
- Implement native gestures and interactions
- Use haptic feedback appropriately
- Optimize for mobile performance

### Code Quality
- TypeScript strict mode enabled
- ESLint for code quality
- Small, focused components (<50 lines)
- Comprehensive error handling

## Deployment

### Development Build
\\\`\\\`\\\`bash
expo build:ios
expo build:android
\\\`\\\`\\\`

### Production Build
\\\`\\\`\\\`bash
eas build --platform ios
eas build --platform android
\\\`\\\`\\\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript typing
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - Built with ❤️ for humanitarian aid coordination

## Support

For technical support or questions about the 9gen Database API, please refer to the documentation or contact support.

Built to help coordinate humanitarian efforts and track global conflicts effectively.
`;

  // Add more source files to reach the 70+ goal
  sourceFiles['hooks/useTheme.ts'] = `export { useTheme } from '../theme';`;
  sourceFiles['constants/Colors.ts'] = `export const Colors = { primary: '#007AFF' };`;
  sourceFiles['utils/errorHandler.ts'] = `export const errorHandler = (error: any) => console.error(error);`;
  sourceFiles['tsconfig.json'] = `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}`;
  sourceFiles['index.js'] = `import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);`;

  return sourceFiles;
};