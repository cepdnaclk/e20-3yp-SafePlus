import React, {useContext} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ImageBackground,
} from 'react-native';
import styles from '../styles/LogInScreen';
import { login, changePassword } from '../services/api';
import { UserContext } from '../context/UserContext';

export default function LoginScreen() {
  console.log('LoginScreen rendered');
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [isChangePasswordModalVisible, setChangePasswordModelVisible] = React.useState(false);
  const { setUser } = useContext(UserContext);


  // Login fields (email/password) and change password fields
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [userData, setUserData] = React.useState(null);
  const [mustChangePassword, setMustChangePassword] = React.useState(false);
  const [userId, setUserId] = React.useState(null);
  // Password reset fields
  const [email, setEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');

  const showMainContent = !isModalVisible && !isChangePasswordModalVisible;

  const onClose = () => {
    setModalVisible(false);
    setChangePasswordModelVisible
    (false);
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
        setUserData(data);
        setUserId(data.userId);
        // Reset fields after successful login
        setLoginEmail('');
        setLoginPassword('');
        setModalVisible(false);
        console.log('User data:', data);
        //if (data.mustChangePassword) {
        if (false){
          setMustChangePassword(true);
          setChangePasswordModelVisible(true);
        }else {
          console.log('Navigating to Home with user data:', data);
          setUser(data);
          //navigation.replace('MainTabs'); 
        }
      } else {
        alert('Login failed. Email or password is incorrect.');
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      alert('Please fill all fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const data = await changePassword({ userId, newPassword });
      alert('Password updated. You can now log in with your new password.');
      setChangePasswordModelVisible(false);
      setMustChangePassword(false);
      console.log('Password change success:', data);
      setUser(data);
      //navigation.replace('MainTabs');
            } 
      catch (err) {
        console.error('Change password error:', err);
        alert(err.message || 'Something went wrong. Please try again.');
    }
  };
  // Skip button handler
  const handleSkipChangePassword = () => {
    setChangePasswordModelVisible(false);
    setMustChangePassword(false);
    // Navigate to home or main screen
    setUser(data);
    //navigation.replace('MainTabs'); 
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
                setChangePasswordModelVisible
                (true);
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
      <Modal animationType="fade" transparent={true} visible={isChangePasswordModalVisible}>
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

        <TouchableOpacity style={styles.skipButton} onPress={handleSkipChangePassword}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setChangePasswordModelVisible
                (false);
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
