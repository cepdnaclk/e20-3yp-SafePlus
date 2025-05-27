// screens/UserAccountPage.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AddHelmetPopup from '../components/AddHelmetPopup.js';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles/UserAccountScreen.js';
export default function UserAccountPage({ navigation }) {
  const [showAddHelmet, setShowAddHelmet] = useState(false);
  const helmets = ['Helmet 1', 'Helmet 2', 'Helmet 3'];

  return (
    <LinearGradient
          colors={['#FFFFFF', '#D8D47D']} // Example: Light teal gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>User: User1</Text>
      
      <Text style={styles.email}>Email: user1@gmail.com</Text>
      <Text style={styles.helmetNo}>Helmet Currently Using: Helmet 1</Text>

      <View style={styles.helmetBox}>
        <Text style={styles.subTitle}>Used Helmet IDs:</Text>
        {helmets.map((helmet, index) => (
          <Text key={index}>{helmet}</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => setShowAddHelmet(true)}>
        <Text>Add a Helmet</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}><Text>Change Currently Using Helmet ID</Text></TouchableOpacity>
      <TouchableOpacity style={styles.button}><Text>See Your History</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#FFC000' }]}><Text>Log Out</Text></TouchableOpacity>

      <AddHelmetPopup visible={showAddHelmet} onClose={() => setShowAddHelmet(false)} />
    </LinearGradient>
  );
}
