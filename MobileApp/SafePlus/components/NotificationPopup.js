import React, { useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function NotificationPopup({ visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Animated.View style={[styles.popup, { transform: [{ translateX: slideAnim }] }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Text style={styles.closeText}>❌</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Notifications (2)</Text>
          <Text>1. Take medication for head impact.</Text>
          <Text>2. You have been dehydrated today.</Text>
          
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  popup: {
    width: '65%',
    height: '100%',
    backgroundColor: '#EADDCA',
    padding: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    elevation: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
});
