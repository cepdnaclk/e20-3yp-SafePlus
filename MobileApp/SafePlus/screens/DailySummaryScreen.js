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

  // Get today's and yesterday's date strings
  const today = new Date();
  const todayStr = getDateString(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  // Filter stats for today and yesterday
  const todayStats = hourlyStats.filter(
    d => d.hourWindowStart && d.hourWindowStart.split('T')[0] === todayStr
  );
  const yesterdayStats = hourlyStats.filter(
    d => d.hourWindowStart && d.hourWindowStart.split('T')[0] === yesterdayStr
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
        <InfoCard title="Today's Summary" colors={['#e0ffe0', '#ccffcc']} isSafe={true}>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>📅 Date: </Text>
            {todayStr}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🪖 Helmet ID: </Text>
            {user?.helmetID || 'Not assigned'}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>⏰ Working Hours: </Text>
            {todaySummary.workingHours} hours
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>⚠️ Emergencies: </Text>
            {todaySummary.totalImpact > 0 ? 'Yes' : 'No'}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🪖 Head Impacts: </Text>
            {todaySummary.totalImpact}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>💨 Gas Alerts: </Text>
            {todaySummary.totalGas}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🚑 Medical Situations: </Text>
            {todaySummary.totalMedicalSituations}
          </Text>
        </InfoCard>

        <InfoCard title="Yesterday's Summary" colors={['#e3f2fd', '#bbdefb']} isSafe={true}>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>📅 Date: </Text>
            {yesterdayStr}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🪖 Helmet ID: </Text>
            {user?.helmetID || 'Not assigned'}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>⏰ Working Hours: </Text>
            {yesterdaySummary.workingHours} hours
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>⚠️ Emergencies: </Text>
            {yesterdaySummary.totalImpact > 0 ? 'Yes' : 'No'}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🪖 Head Impacts: </Text>
            {yesterdaySummary.totalImpact}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>💨 Gas Alerts: </Text>
            {yesterdaySummary.totalGas}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>🚑 Medical Situations: </Text>
            {yesterdaySummary.totalMedicalSituations}
          </Text>
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
}