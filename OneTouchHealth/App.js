import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { initDB } from './src/utils/database';
import { colors } from './src/utils/theme';

import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import PaywallScreen from './src/screens/PaywallScreen';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    try { initDB(); } catch (e) { console.warn('DB init:', e); }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: colors.bg },
            animationEnabled: true,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Scan" component={ScanScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
