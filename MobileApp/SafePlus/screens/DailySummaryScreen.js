import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import InfoCard from '../components/InfoCard';
import styles from '../styles/HomeScreen';
import { UserContext } from '../context/UserContext';

function getDateString(date) {
  // Returns 'YYYY-MM-DD'
  return date.toISOString().split('T')[0];
}

export default function DailySummaryScreen() {
  const { user, hourlyStats } = React.useContext(UserContext);
  console.log('user.helmetID:', user?.helmetID);
  console.log('hourlyStats helmetIds:', hourlyStats.map(d => d.helmetId));  // Get today's and yesterday's date strings
  console.log('hourlyStats:', hourlyStats);
  const today = new Date();
  const todayStr = getDateString(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  // Filter stats for today and yesterday
  const todayStats = hourlyStats.filter(
    d => d.hourWindowStart && d.hourWindowStart.split('T')[0] === todayStr&&
    d.helmetId === user?.helmetID
  );
  const yesterdayStats = hourlyStats.filter(
    d => d.hourWindowStart && d.hourWindowStart.split('T')[0] === yesterdayStr&&
    d.helmetId === user?.helmetID
  );

  // Helper to calculate summary
  const getSummary = stats => {
    const totalImpact = stats.reduce((sum, d) => sum + (d.impactCount || 0), 0);
    const totalGas = stats.reduce((sum, d) => sum + (d.gasAlertCount || 0), 0);
    const totalMedicalSituations = totalImpact > 0 ? totalImpact + totalGas : 0;
    const workingHours = stats.length;
    return { totalImpact, totalGas, totalMedicalSituations, workingHours };
  };

  const todaySummary = getSummary(todayStats);
  const yesterdaySummary = getSummary(yesterdayStats);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <InfoCard title="Today's Summary"  isSafe={true}>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>📅 Date: </Text>
            <Text>{todayStr}</Text>
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🪖 Helmet ID: </Text>
            <Text>{user?.helmetID || 'Not assigned'}</Text>
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>⏰ Working Hours: </Text>
            <Text>{todaySummary.workingHours} hours</Text>
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>⚠️ Emergencies: </Text>
            <Text>{todaySummary.totalImpact > 0 ? 'Yes' : 'No'}</Text>
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🪖 Head Impacts: </Text>
            <Text>{todaySummary.totalImpact}</Text>
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>💨 Gas Alerts: </Text>
            <Text>{todaySummary.totalGas}</Text>
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🚑 Medical Situations: </Text>
            <Text>{todaySummary.totalMedicalSituations}</Text>
          </Text>
        </InfoCard>

        <InfoCard title="Yesterday's Summary" colors={['#fef6e4']} isSafe={true}>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>📅 Date: </Text>
            <Text>{yesterdayStr}</Text>
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🪖 Helmet ID: </Text>
            <Text>{user?.helmetID || 'Not assigned'}</Text>
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>⏰ Working Hours: </Text>
            <Text>{yesterdaySummary.workingHours} hours</Text>
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>⚠️ Emergencies: </Text>
            <Text>{yesterdaySummary.totalImpact > 0 ? 'Yes' : 'No'}</Text>
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🪖 Head Impacts: </Text>
            <Text>{yesterdaySummary.totalImpact}</Text>
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>💨 Gas Alerts: </Text>
            <Text>{yesterdaySummary.totalGas}</Text>
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🚑 Medical Situations: </Text>
            <Text>{yesterdaySummary.totalMedicalSituations}</Text>
          </Text>
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
}