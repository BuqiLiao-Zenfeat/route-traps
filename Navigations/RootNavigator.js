import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MapScreen from '../Screens/MapScreen';
import LocationSearchScreen from '../Screens/LocationSearchScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Location Search" component={LocationSearchScreen} />
    </Stack.Navigator>
  );
}