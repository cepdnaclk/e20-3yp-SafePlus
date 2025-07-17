import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LogInScreen';
import MainTabNavigator from './MainTabNavigator';
import { UserProvider, UserContext } from './context/UserContext';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user } = useContext(UserContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  console.log('App.js loaded');

  return (
    <UserProvider>
      <RootNavigator />
    </UserProvider>
  );
}
