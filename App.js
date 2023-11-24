
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import RootNavigator from './Navigations/RootNavigator';

function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style='auto' backgroundColor='white' />
    </NavigationContainer>
  )
}

export default function Root() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <App />
    </SafeAreaProvider>
  );
}
