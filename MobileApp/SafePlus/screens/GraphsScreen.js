import React, { useEffect, useState, useContext } from 'react';
import { ScrollView ,SafeAreaView} from 'react-native';
import GraphCard from '../components/GraphCard';
import styles from '../styles/HomeScreen';
import {  } from '../services/api'; 
import { UserContext } from '../context/UserContext';

export default function GraphsScreen() {
  //const [hourlyStats, setHourlyStats] = useState([]);
  const { hourlyStats } = useContext(UserContext);

 /* useEffect(() => {
    if (user?.helmetId) {
      console.log('Fetching hourly stats for helmet ID:', user.helmetId);
      fetchHourlyStats(user.helmetId)
        .then(setHourlyStats)
        .catch(err => {
          console.error('Failed to fetch hourly stats:', err);
          setHourlyStats([]);
        });
    }
  }, [user?.helmetId]);*/

  const extractGraphData = (key) => {
  const desiredLength = 20;
  const values = hourlyStats.map(d => d[key] ?? 0);
  // Use the full hourWindowStart as label, not just the time!
  const labels = hourlyStats.map(d => d.hourWindowStart || '');
  return {
    labels: Array(Math.max(0, desiredLength - labels.length)).fill('').concat(labels),
    values: Array(Math.max(0, desiredLength - values.length)).fill(0).concat(values),
  };
};

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content}>
      <GraphCard title="Temperature Percentage" data={extractGraphData("avgTemp")} />
      <GraphCard title="Humidity Percentage" data={extractGraphData("avgHum")} />
      <GraphCard title="Air Quality in PPM" data={extractGraphData("gasAlertCount")} />
    </ScrollView>
    </SafeAreaView>
  );
}