// ==========================================
// NavEd - Campus Navigation & Study Assistant
// Modern Minimal Design
// ==========================================

import React, { useEffect } from 'react';
import { StatusBar, Platform, LogBox, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

// Contexts
import { AppProvider, useApp } from '../shared/contexts/AppContext';
import { ThemeProvider, useTheme } from '../shared/contexts/ThemeContext';
import { AuthProvider, useAuth } from '../shared/contexts/AuthContext';

// Components
import ErrorBoundary from '../shared/components/common/ErrorBoundary';

// Screens
import CampusMapScreen from '../features/navigation/screens/CampusMapScreen';
import ParkingScreen from '../features/parking/screens/ParkingScreen';
import StudyAssistantScreen from '../features/study/screens/StudyAssistantScreen';
import SettingsScreen from '../shared/screens/SettingsScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import SignupScreen from '../features/auth/screens/SignupScreen';

// Services
import { initializeAccessibility } from '../shared/services/accessibilityService';
import { setupParkingAlerts } from '../features/parking/services/parkingService';
import { loadApiKeys } from '../features/study/services/studyAssistantService';
import { initializeNotifications } from '../shared/services/notificationService';

// Theme
import { componentSizes } from '../shared/theme';

// Ignore specific warnings
// Ignore specific warnings
if (LogBox) {
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
  ]);
}

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// Tab Navigator with Theme Support
function TabNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Calculate proper bottom padding for Android soft navigation buttons
  const bottomPadding = Platform.OS === 'ios' ? 25 : Math.max(insets.bottom, 10);
  const tabBarHeight = Platform.OS === 'ios' ? 85 : componentSizes.tabBar.height + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'home';

          switch (route.name) {
            case 'Map':
              iconName = 'map';
              break;
            case 'Parking':
              iconName = 'local-parking';
              break;
            case 'Study':
              iconName = 'school';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
          }

          return (
            <View style={{
              padding: 4,
              borderRadius: 12,
              backgroundColor: focused ? `${theme.colors.primary}15` : 'transparent',
            }}>
              <MaterialIcons
                name={iconName}
                size={componentSizes.tabBar.iconSize}
                color={color}
              />
            </View>
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarAccessibilityLabel: `${route.name} tab`,
      })}
    >
      <Tab.Screen
        name="Map"
        component={CampusMapScreen}
        options={{
          title: 'Campus Map',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Parking"
        component={ParkingScreen}
        options={{
          title: 'Parking',
        }}
      />
      <Tab.Screen
        name="Study"
        component={StudyAssistantScreen}
        options={{
          title: 'Study',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Navigator (only shown if auth is enabled and user not authenticated)
function AuthNavigator() {
  const [isSignup, setIsSignup] = React.useState(false);

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      {isSignup ? (
        <AuthStack.Screen name="Signup">
          {() => (
            <SignupScreen
              onNavigateToLogin={() => setIsSignup(false)}
              onSignupSuccess={() => {
                // If user is automatically logged in after signup, 
                // AuthContext will update and navigation will switch to main app
                // Otherwise, switch to login screen for email confirmation
                setIsSignup(false);
              }}
            />
          )}
        </AuthStack.Screen>
      ) : (
        <AuthStack.Screen name="Login">
          {() => (
            <LoginScreen
              onNavigateToSignup={() => setIsSignup(true)}
              onLoginSuccess={() => {
                // Auth state will update automatically via AuthContext
                // Navigation will switch to main app when isAuthenticated becomes true
              }}
            />
          )}
        </AuthStack.Screen>
      )}
    </AuthStack.Navigator>
  );
}

// Main App Content
function AppContent() {
  const { theme } = useTheme();
  const { isAuthEnabled, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize services individually with error handling
      try {
        await initializeAccessibility();
      } catch (e) {
        console.log('Accessibility init error:', e);
      }

      try {
        await initializeNotifications();
      } catch (e) {
        console.log('Notifications init error:', e);
      }

      try {
        await setupParkingAlerts();
      } catch (e) {
        console.log('Parking alerts init error:', e);
      }

      try {
        await loadApiKeys();
      } catch (e) {
        console.log('API keys init error:', e);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      // Hide splash screen
      await SplashScreen.hideAsync();
    }
  };

  // Show auth screens only if auth is enabled AND user is not authenticated
  // If auth is not configured, show main app directly (existing behavior)
  const shouldShowAuth = isAuthEnabled && !isAuthenticated && !authLoading;

  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:242',message:'AppContent render',data:{isAuthEnabled,isAuthenticated,authLoading,shouldShowAuth},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'B'})}).catch(()=>{});
  }, [isAuthEnabled, isAuthenticated, authLoading, shouldShowAuth]);
  // #endregion

  return (
    <>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      <NavigationContainer
        theme={{
          dark: theme.isDark,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.textPrimary,
            border: theme.colors.border,
            notification: theme.colors.error,
          },
        }}
      >
        {shouldShowAuth ? (
          <AuthNavigator />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={TabNavigator} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </>
  );
}

// Root App with All Providers
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <AppProvider>
              <AppContent />
            </AppProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
