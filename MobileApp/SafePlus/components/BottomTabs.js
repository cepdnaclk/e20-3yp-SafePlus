import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DailySummaryScreen from '../screens/DailySummaryScreen';
import GraphsScreen from '../screens/GraphsScreen';
import HabitsScreen from '../screens/HabitsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="DailySummary"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'DailySummary') iconName = 'today';
          else if (route.name === 'Graphs') iconName = 'bar-chart';
          else if (route.name === 'Habits') iconName = 'emoji-people';
          else if (route.name === 'Profile') iconName = 'person';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="DailySummary" component={DailySummaryScreen} />
      <Tab.Screen name="Graphs" component={GraphsScreen} />
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
