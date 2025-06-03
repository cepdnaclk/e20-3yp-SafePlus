import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, Image } from 'react-native';
import styles from '../styles/UserAccountScreen.js';
import { UserContext } from '../context/UserContext.js';
import { changePassword } from '../services/api.js';

export default function UserAccountScreen() {
  const { user, setUser } = React.useContext(UserContext);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Function to handle password change
  const handleChangePassword = () => {
    console.log('Attempting to change password for user:', user.userId);
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    changePassword({ userId: user.userId, newPassword })
      .then(() => {
        Alert.alert('Success', 'Password changed successfully!');
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        console.log('Password changed successfully for user:', user.userId);
      })
      .catch((error) => {
        Alert.alert('Error', error.message || 'Failed to change password.');
      });
  };

  // Function to handle logout
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => setUser(null) }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#fef6e4', flex: 1 }]}>
      <View style={[styles.container, { paddingTop: 24 }]}>
        {/* User Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Image
            source={require('../assets/user_avatar.png')}
            style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 8, backgroundColor: '#FFD966' }}
            resizeMode="cover"
          />
          <Text style={[styles.title, { color: '#5d4b1f', fontSize: 22 }]}>User Account</Text>
        </View>

        {/* User Info Card */}
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 18,
          marginBottom: 18,
          elevation: 3,
          shadowColor: '#000',
          shadowOpacity: 0.07,
          shadowRadius: 4,
        }}>
          <Text style={[styles.email, { color: '#333', fontWeight: 'bold' }]}>Name:</Text>
          <Text style={[styles.email, { color: '#5d4b1f', marginBottom: 8 }]}>{user?.username || 'Unknown'}</Text>
          <Text style={[styles.email, { color: '#333', fontWeight: 'bold' }]}>Email:</Text>
          <Text style={[styles.email, { color: '#5d4b1f', marginBottom: 8 }]}>{user?.email || 'Not available'}</Text>
          <Text style={[styles.helmetNo, { color: '#333', fontWeight: 'bold' }]}>
            Helmet Currently Using:
          </Text>
          <Text style={[styles.helmetNo, { color: '#5d4b1f' }]}>{user?.helmetID || 'None'}</Text>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#e0cfa9', marginVertical: 8 }} />

        {/* Actions */}
        <TouchableOpacity
          style={[styles.button, { marginBottom: 8 }]}
          onPress={() => setShowPasswordModal(true)}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#333', fontWeight: 'bold' }}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FFC000', marginTop: 8 }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#333', fontWeight: 'bold' }}>Log Out</Text>
        </TouchableOpacity>

        {/* Change Password Modal */}
        <Modal
          visible={showPasswordModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[styles.subTitle, { color: '#333', marginBottom: 12 }]}>Change Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Old Password"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#999"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, marginRight: 8 }]}
                  onPress={handleChangePassword}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#333', fontWeight: 'bold' }}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, backgroundColor: '#eee' }]}
                  onPress={() => setShowPasswordModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}