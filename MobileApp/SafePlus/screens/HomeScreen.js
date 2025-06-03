import React,{useContext} from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import styles from '../styles/HomeScreen'; // Adjust the path as necessary
import { UserContext } from '../context/UserContext';

export default function HomeScreen() {
  const { user } = useContext(UserContext);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.welcomeText}>Welcome to <Text style={styles.highlight}>SafePlus</Text>, {user?.username || 'User'}!</Text>
        
        <Text style={styles.instructionsTitle}>👷 Helmet Usage Instructions</Text>
        <Text style={styles.instruction}>✅ Ensure the helmet fits snugly on your head</Text>
        <Text style={styles.instruction}>✅ Adjust the chin strap for comfort and safety</Text>
        <Text style={styles.instruction}>⚠️ Always wear the helmet when on-site</Text>
        <Text style={styles.instruction}>🧼 Keep the helmet clean and inspect it regularly</Text>
        <Text style={styles.instruction}>🔋 Make sure the helmet's sensors are powered and connected</Text>

        <Text style={styles.footerNote}>Stay safe and follow protocols for your protection!</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

