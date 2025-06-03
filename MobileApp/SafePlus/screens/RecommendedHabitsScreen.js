import React, { useContext, useEffect } from 'react';
import { ScrollView, Text, View, StyleSheet,Button,SafeAreaView } from 'react-native';
import { UserContext } from '../context/UserContext';
import InfoCard from '../components/InfoCard';
import { useIsFocused } from '@react-navigation/native';
import styles from '../styles/HomeScreen'; // Adjust the path as necessary



export default function RecommendedHabitsScreen() {
  const { notifications, markNotificationsRead, deleteNotification } = useContext(UserContext);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      // Fetch notifications or perform any updates when the screen is focused
      markNotificationsRead(); // Mark all notifications as read
    }
  }, [isFocused, markNotificationsRead]);
  // Calculate notifications


  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={stylesNotification.content}>
      {notifications.length === 0 ? (
        <InfoCard title="No Notifications" colors={['#e0e0e0', '#f5f5f5']} isSafe={true}>
          <Text>No new notifications for today.</Text>
        </InfoCard>
      ) : (
        notifications.map((n, idx) => (
          <InfoCard
            key={idx}
            title="Notification"
            colors={n.type === 'impact' ? ['#ffe0e0', '#ffcccc'] : ['#fffbe0', '#fff7cc']}
            isSafe={n.type !== 'impact'}
          >
            <Text style={{ color: n.type === 'impact' ? 'red' : undefined }}>{n.message}</Text>
            <Button title="Delete" color="#b71c1c" onPress={() => deleteNotification(n.id)} />

          </InfoCard>
        ))
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const stylesNotification = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
  },
});