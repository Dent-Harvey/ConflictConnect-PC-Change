import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from './hooks/useTheme';
import { useFirebaseAuth } from './contexts/FirebaseAuthContext';
import { AuthenticationFlow } from './components/AuthenticationFlow';
import MainScreen from './app/index';

const Stack = createStackNavigator();

export default function App() {
  const theme = useTheme();
  const { user, isLoading: authLoading, needsProfileSetup } = useFirebaseAuth();

  // Show authentication flow if not authenticated or needs profile setup
  if ((!user || needsProfileSetup) && !authLoading) {
    return <AuthenticationFlow />;
  }

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: theme.colors.background 
      }}>
        <p style={{ color: theme.colors.text }}>
          Initializing Conflict Controller...
        </p>
      </div>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={theme.colors.background} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
