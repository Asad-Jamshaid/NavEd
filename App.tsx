// ==========================================
// NavEd - Campus Navigation & Study Assistant
// Budget-Friendly App for Students
// ==========================================

import React, { useEffect } from 'react';
import { StatusBar, Platform, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

// Contexts
import { AppProvider, useApp } from './src/contexts/AppContext';

// Screens
import CampusMapScreen from './src/screens/navigation/CampusMapScreen';
import ParkingScreen from './src/screens/parking/ParkingScreen';
import StudyAssistantScreen from './src/screens/study/StudyAssistantScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';

// Services
import { initializeAccessibility } from './src/services/accessibilityService';
import { setupParkingAlerts } from './src/services/parkingService';
import { loadApiKeys } from './src/services/studyAssistantService';

// Constants
import { COLORS } from './src/utils/constants';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Navigator
function TabNavigator() {
  const { state } = useApp();
  const highContrast = state.user?.preferences.highContrast;

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

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: highContrast ? '#FFFF00' : COLORS.primary,
        tabBarInactiveTintColor: highContrast ? '#AAAAAA' : COLORS.gray,
        tabBarStyle: {
          backgroundColor: highContrast ? '#000000' : COLORS.white,
          borderTopColor: highContrast ? '#FFFFFF' : COLORS.grayLight,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: highContrast ? '#000000' : COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '700',
        },
        // Accessibility
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
  const { state } = useApp();

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

  const highContrast = state.user?.preferences.highContrast;
  const darkMode = state.user?.preferences.darkMode;

  return (
    <>
      <StatusBar
        barStyle={highContrast || darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={highContrast ? '#000000' : COLORS.primary}
      />
      <NavigationContainer
        theme={{
          dark: !!(darkMode || highContrast),
          colors: {
            primary: highContrast ? '#FFFF00' : COLORS.primary,
            background: highContrast ? '#000000' : darkMode ? '#121212' : COLORS.background,
            card: highContrast ? '#000000' : darkMode ? '#1E1E1E' : COLORS.white,
            text: highContrast ? '#FFFFFF' : darkMode ? '#FFFFFF' : COLORS.black,
            border: highContrast ? '#FFFFFF' : COLORS.grayLight,
            notification: COLORS.error,
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

// Root App
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
