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
import { AppProvider, useApp } from './src/contexts/AppContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Components
import ErrorBoundary from './src/components/common/ErrorBoundary';

// Screens
import CampusMapScreen from './src/screens/navigation/CampusMapScreen';
import ParkingScreen from './src/screens/parking/ParkingScreen';
import StudyAssistantScreen from './src/screens/study/StudyAssistantScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';

// Services
import { initializeAccessibility } from './src/services/accessibilityService';
import { setupParkingAlerts } from './src/services/parkingService';
import { loadApiKeys } from './src/services/studyAssistantService';
import { initializeNotifications } from './src/services/notificationService';

// Theme
import { componentSizes } from './src/theme';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

// Main App Content
function AppContent() {
  const { theme } = useTheme();

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
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
        </Stack.Navigator>
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
          <AppProvider>
            <AppContent />
          </AppProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
