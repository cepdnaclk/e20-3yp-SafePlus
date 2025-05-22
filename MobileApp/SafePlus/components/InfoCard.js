import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function InfoCard({ title, children, isSafe = true, colors }) {
  const borderColor = isSafe ? '#80e27e' : '#ef5350'; // green or red

  return (
    <View style={[styles.outerBorder, { borderColor }]}>
      <LinearGradient colors={colors} style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{children}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerBorder: {
    borderWidth: 3,
    borderRadius: 16,
    marginVertical: 12,
    padding: 2,
  },
  card: {
    borderRadius: 12,
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  text: {
    fontSize: 14,
    color: '#555',
  },
});
