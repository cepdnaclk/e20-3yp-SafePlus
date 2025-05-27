import React, { useState ,useEffect} from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import NotificationPopup from '../components/NotificationPopup';
import GraphCard from '../components/GraphCard';
import InfoCard from '../components/InfoCard';
import { LinearGradient } from 'expo-linear-gradient';
import UserAccountPage from './UserAccountScreen';
import styles from '../styles/HomeScreen';

export default function HomePage({ navigation }) {
  const [showNotifications, setShowNotifications] = useState(false);
     useEffect(() => {
    console.log("Popup visibility state changed:", showNotifications);
  }, [showNotifications]);
  // Mocked backend data
  const heartRateData = {
    labels: ['8am', '10am', '12pm', '2pm', '4pm'],
    values: [72, 78, 90, 85, 76],
  };

  const tempHumidityData = {
    labels: ['8am', '10am', '12pm', '2pm', '4pm'],
    values: [22, 24, 26, 25, 23],
  };

  const airQualityData = {
    labels: ['8am', '10am', '12pm', '2pm', '4pm'],
    values: [40, 45, 60, 55, 50],
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#D8D47D']} // Example: Light teal gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <TouchableOpacity style={styles.accountIcon} onPress={() => navigation.navigate('Account')}>
        <Text style={styles.icon}>👤</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.notificationIcon} onPress={() => {console.log('Notification icon pressed'); setShowNotifications(true);console.log("State after button press:", showNotifications);}}>
        <Text style={styles.icon}>🔔</Text>
      </TouchableOpacity>

      <Text style={styles.welcome}>Welcome to <Text style={styles.bold}>SafePlus User1!!</Text></Text>

      <ScrollView contentContainerStyle={styles.content}>
        <InfoCard title="Daily Summary" colors={['#e0ffe0', '#ccffcc']} isSafe={true}>
          • Working Hours: 8{'\n'}
          • Emergencies: No{'\n'}
          • Head Impacts: No{'\n'}
          • Medical Situations: No
        </InfoCard>

        <InfoCard title="Recommended Habits" colors={['#e0ffe0', '#ccffcc']} isSafe={true}>
          • Drink more water throughout the day
        </InfoCard>
        
        <GraphCard title="Heart Rate" data={heartRateData} colors={['#f0f0f0', '#d9d9d9']} />
        <GraphCard title="Temperature and Humidity" data={tempHumidityData} colors={['#f5f5f5', '#e0e0e0']} isSafe={Math.max(...tempHumidityData.values) < 30} />
        <GraphCard title="Air Quality Level" data={airQualityData} colors={['#f0f0f0', '#dcdcdc']} isSafe={Math.max(...airQualityData.values) < 80} />
      </ScrollView>

      {/* This is the only occurrence of NotificationPopup */}
      <NotificationPopup visible={showNotifications} onClose={() => setShowNotifications(false)} />
    </LinearGradient>
  );
}
