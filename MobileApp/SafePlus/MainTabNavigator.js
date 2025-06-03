import { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Image } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import DailySummaryScreen from './screens/DailySummaryScreen';
import GraphsScreen from './screens/GraphsScreen';
import RecommendedHabitsScreen from './screens/RecommendedHabitsScreen';
import UserAccountScreen from './screens/UserAccountScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserContext } from './context/UserContext';


const Tab = createBottomTabNavigator();

const headerOptions = (title) => ({
  headerStyle: { backgroundColor: 'black' },
  headerTitleAlign: 'left',
  headerTitle: () => (
    <Text style={{ color: '#fdd835', fontWeight: 'bold', fontSize: 25 }}>{title}</Text>
  ),
  headerLeft: () => (
    <Image
      source={require('./assets/logo.png')}
      style={{ width: 40, height: 40, marginRight: 10, marginLeft: 10, borderRadius: 20 }}
      resizeMode="contain"
    />
  ),
});

export default function MainTabNavigator() {
  const { unread, notifications } = useContext(UserContext);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#d7c49d', // light brown
        },
        tabBarActiveTintColor: '#5d4b1f', // dark brown for icon/text when selected
        tabBarInactiveTintColor: '#af8366', // medium brown for unselected
        headerShown: true, // keep headers as you set in headerOptions
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          ...headerOptions('Home'),
          tabBarIcon: ({ color, size }) => <Icon name="home-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Daily Summary"
        component={DailySummaryScreen}
        options={{
          ...headerOptions('Daily Summary'),
          tabBarIcon: ({ color, size }) => <Icon name="clipboard-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={GraphsScreen}
        options={{
          ...headerOptions('Statistics'),
          tabBarIcon: ({ color, size }) => <Icon name="bar-chart-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={RecommendedHabitsScreen}
        options={{
          ...headerOptions('Notification'),
          tabBarIcon: ({ color, size }) => <Icon name="notifications-outline" color={color} size={size} />,
          tabBarBadge: unread && notifications.length > 0 ? notifications.length : undefined,
          tabBarBadgeStyle: { backgroundColor: 'red', color: 'white' },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={UserAccountScreen}
        options={{
          ...headerOptions('User Profile'),
          tabBarIcon: ({ color, size }) => <Icon name="person-outline" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}