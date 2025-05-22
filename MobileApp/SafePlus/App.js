import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import WelcomeScreen from "./screens/WelcomeScreen";
import HomePage from "./screens/HomeScreen";
import UserAccountPage from "./screens/UserAccountScreen";
import IotCoreComponent from "./SensorOutputs";
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Data" component={IotCoreComponent}/>
        <Stack.Screen name="Account" component={UserAccountPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
