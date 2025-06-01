import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import NotificationPopup from '../components/NotificationPopup';
import GraphCard from '../components/GraphCard';
import InfoCard from '../components/InfoCard';
import styles from '../styles/HomeScreen';
import { fetchHourlyStats } from '../services/api'; // <-- use the new API function

export default function HomePage({ route, navigation }) {
  const { user } = route.params || {};
  const [showNotifications, setShowNotifications] = useState(false);
  const [hourlyStats, setHourlyStats] = useState([]);

  // Replace this with how you get the helmetId for the user
  const helmetId = user?.helmetId || 'your-default-helmet-id';

  useEffect(() => {
    if (helmetId) {
      fetchHourlyStats(helmetId)
        .then(data => {
          // If your API returns a single object, wrap it in an array for consistency
          setHourlyStats(Array.isArray(data) ? data : [data]);
        })
        .catch(error => console.error("Failed to load hourly stats:", error));
    }
  }, [helmetId]);

  // Extract graph data from hourlyStats
  const extractGraphData = (key) => {
    const desiredLength = 20;
    if (!hourlyStats || hourlyStats.length === 0) return {
      labels: Array(desiredLength).fill(''),
      values: Array(desiredLength).fill(0),
    };
    const values = hourlyStats.map(d => d[key] ?? 0);
    const labels = hourlyStats.map(d =>
      d.hourWindowStart
        ? new Date(d.hourWindowStart).toLocaleTimeString().slice(0, 5)
        : ''
    );
    const paddedValues = Array(Math.max(0, desiredLength - values.length)).fill(0).concat(values);
    const paddedLabels = Array(Math.max(0, desiredLength - labels.length)).fill('').concat(labels);
    return {
      labels: paddedLabels,
      values: paddedValues,
    };
  };

  const tempData = extractGraphData("avgTemp");
  const humidityData = extractGraphData("avgHum");
  const airQualityData = extractGraphData("gasAlertCount");
  const impactData = extractGraphData("impactCount");

  // Example: Merge temp and humidity for a single graph
  const tempHumidityData = {
    labels: tempData.labels,
    values: tempData.values.map((temp, idx) => (temp + humidityData.values[idx]) / 2),
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FFF6E5' }]}>
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
          • Head Impacts: {impactData.values.reduce((a, b) => a + b, 0)}{'\n'}
          • Medical Situations: No
        </InfoCard>

        <InfoCard title="Recommended Habits" colors={['#e0ffe0', '#ccffcc']} isSafe={true}>
          • Drink more water throughout the day
        </InfoCard>

        <GraphCard title="Temperature and Humidity" data={tempHumidityData} colors={['#f5f5f5', '#e0e0e0']} />
        <GraphCard title="Air Quality Alerts" data={airQualityData} colors={['#f0f0f0', '#dcdcdc']} />
        <GraphCard title="Impacts" data={impactData} colors={['#f0f0f0', '#d9d9d9']} />
      </ScrollView>

      <NotificationPopup visible={showNotifications} onClose={() => setShowNotifications(false)} />
    </View>
  );
}