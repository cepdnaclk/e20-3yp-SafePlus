import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ImageBackground,
} from 'react-native';
import styles from '../styles/WelcomeScreen';
import { login, changePassword } from '../services/api';

export default function WelcomeScreen({ navigation }) {
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [isSignupModalVisible, setSignupModalVisible] = React.useState(false);

  // Login fields (email/password)
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');

  // Password reset fields
  const [email, setEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');

  const showMainContent = !isModalVisible && !isSignupModalVisible;

  const onClose = () => {
    setModalVisible(false);
    setSignupModalVisible(false);
  };

  const handleLogin = async () => {
    try {
      console.log('Attempting login with email:', loginEmail);
      if (!loginEmail || !loginPassword) {
        alert('Please enter both email and password.');
        return;
      }
      const data = await login({ email: loginEmail.trim().toLowerCase(), password: loginPassword });
      console.log('Login success:', data);
      if (data.userId) {
        setLoginEmail('');
        setLoginPassword('');
        navigation.navigate('Home', { user: data });
      } else {
        alert('Login failed. Email or password is incorrect.');
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleChangePassword = async () => {
    if (!email || !newPassword || !confirmNewPassword) {
      alert('Please fill all fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const data = await changePassword({ email, newPassword });
      alert('Password updated. You can now log in.');
      setSignupModalVisible(false);
      setModalVisible(true);
    } catch (err) {
      console.error('Change password error:', err);
      alert(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background2.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.fullScreenOverlay} />
      <View style={styles.contentContainer}>
        {showMainContent && (
          <>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>SafePlus</Text>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => setSignupModalVisible(true)}
            >
              <Text style={styles.signupButtonText}>Change Password</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Login Modal */}
      <Modal animationType="fade" transparent={true} visible={isModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.signupModal]}>
            <View style={styles.tabs}>
              <Text style={styles.tabText}>Log In</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={loginEmail}
              onChangeText={setLoginEmail}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={loginPassword}
              onChangeText={setLoginPassword}
            />

            <TouchableOpacity style={styles.googleButton}>
              <Image
                source={require('../assets/google_logo.jpeg')}
                style={styles.icon}
              />
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleLogin}
            >
              <Text style={styles.authText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSignupModalVisible(true);
                setModalVisible(false);
              }}
            >
              <Text style={styles.loginSwitchText}>
                Forgot password? Reset here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal animationType="fade" transparent={true} visible={isSignupModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.signupModal]}>
            <View style={styles.tabs}>
              <Text style={styles.tabText}>Set Password</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Registered Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />

            <TouchableOpacity style={styles.authButton} onPress={handleChangePassword}>
              <Text style={styles.authText}>Update Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSignupModalVisible(false);
                setModalVisible(true);
              }}
            >
              <Text style={styles.loginSwitchText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
