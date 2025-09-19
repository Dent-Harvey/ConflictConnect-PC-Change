import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StatusBar, Text, View } from 'react-native';
import MainScreen from './app/index';
import { AuthenticationFlow } from './components/AuthenticationFlow';
import { useFirebaseAuth } from './contexts/FirebaseAuthContext';
import { useTheme } from './hooks/useTheme';

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
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: theme.colors.background 
      }}>
        <Text style={{ color: theme.colors.text }}>
          Initializing Conflict Controller...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
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
