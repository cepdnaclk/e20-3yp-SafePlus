import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import NotificationPopup from '../components/NotificationPopup';
import GraphCard from '../components/GraphCard';
import InfoCard from '../components/InfoCard';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles/HomeScreen';
import { fetchUserData } from '../services/api'; 

export default function HomePage({ route, navigation }) {
  const { user } = route.params || {};
  const [showNotifications, setShowNotifications] = useState(false);
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    if (user?.userId) {
      console.log("Fetching data for user:", user.userId);
      fetchUserData(user.userId)
        .then(data => setSensorData(data))
        .catch(error => console.error("Failed to load sensor data:", error));
    }
  }, [user]);

  const extractGraphData = (key) => {
    const desiredLength = 20; // 24 hours
    if (!sensorData || sensorData.length === 0) return { labels: Array(desiredLength).fill(''),
      values: Array(desiredLength).fill(0),};
    const values = sensorData.map(d => d[key]);
  const labels = sensorData.map(d => new Date(d.timestamp).toLocaleTimeString().slice(0, 5));

  const paddedValues = Array(Math.max(0, desiredLength - values.length)).fill(0).concat(values);
  const paddedLabels = Array(Math.max(0, desiredLength - labels.length)).fill('').concat(labels);

  return {
    labels: paddedLabels,
    values: paddedValues,
    };
  };

  const heartRateData = extractGraphData("heart_rate");
  const tempData = extractGraphData("temperature");
  const humidityData = extractGraphData("humidity");
  const airQualityData = extractGraphData("gasvalues");

  // Merge temp and humidity for a single graph
  const tempHumidityData = {
    labels: tempData.labels,
    values: tempData.values.map((temp, index) => (temp + humidityData.values[index]) / 2),
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#D8D47D']} style={styles.container}>
      <TouchableOpacity style={styles.accountIcon} onPress={() => navigation.navigate('Account')}>
        <Text style={styles.icon}>👤</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.notificationIcon} onPress={() => setShowNotifications(true)}>
        <Text style={styles.icon}>🔔</Text>
      </TouchableOpacity>

      <Text style={styles.welcome}>
        Welcome to <Text style={styles.bold}>SafePlus, {user?.username || 'Guest'}</Text>
      </Text>

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

      <NotificationPopup visible={showNotifications} onClose={() => setShowNotifications(false)} />
    </LinearGradient>
  );
}
