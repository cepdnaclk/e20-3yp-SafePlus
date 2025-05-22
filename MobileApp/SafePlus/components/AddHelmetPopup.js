// components/AddHelmetPopup.js
import React, { useState ,useEffect} from 'react';
import { Modal, View, TextInput, Text, TouchableOpacity, StyleSheet, ModalProps, Animated } from 'react-native';

export default function AddHelmetPopup({ visible, onClose }) {
  const [helmetId, setHelmetId] = useState('');
  const [workingId, setWorkingId] = useState('');

  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <TextInput placeholder="Helmet ID" style={styles.input} value={helmetId} onChangeText={setHelmetId} />
          <TextInput placeholder="Your Working ID" style={styles.input} value={workingId} onChangeText={setWorkingId} />
          <TouchableOpacity style={styles.button} onPress={() => onClose()}>
            <Text style={{ color: 'white' }}>Add Helmet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  popup: { width: 250, backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
  input: { width: '100%', borderBottomWidth: 1, marginVertical: 10 },
  button: { backgroundColor: 'goldenrod', padding: 10, borderRadius: 5, marginTop: 10 },
});
