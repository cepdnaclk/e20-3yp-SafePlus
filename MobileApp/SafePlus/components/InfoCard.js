import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function InfoCard({ title, children ,colors}) {
  return (
    <View style={[styles.card, { backgroundColor: colors?.[0] || 'white' }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View> {/* NEW: wrap children in a View */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  content: {
    // Optional padding or alignment
  },
});
