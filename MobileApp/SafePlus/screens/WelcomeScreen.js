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
import { login, signup } from '../services/api';


export default function WelcomeScreen({ navigation }) {
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [isSignupModalVisible, setSignupModalVisible] = React.useState(false);
  const [signupUsername, setSignupUsername] = React.useState('');
  const [signupEmail, setSignupEmail] = React.useState('');
  const [signupPassword, setSignupPassword] = React.useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = React.useState('');
  const [loginUsername, setLoginUsername] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const showMainContent = !isModalVisible && !isSignupModalVisible;

  const onClose = () => {
    
    setModalVisible(false);
    setSignupModalVisible(false);
  };

  const handleLogin = async () => {
  try {
    const data = await login({ username: loginUsername, password: loginPassword });
    console.log('Login success:', data);
    if (data.userId) {
      // Clear login fields 
      setLoginUsername('');
      setLoginPassword('');
    navigation.navigate('Home', { user:data});}
    else {
      alert('Login failed. User Name or password is incorrect.');
    }
  } catch (err) {
    console.error('Login failed:', err);
  }
};
  const handleSignup = async () => {
  if (!signupUsername || !signupEmail || !signupPassword || !signupConfirmPassword) {
    alert('Please fill all the fields.');
    return;
  }
  if (signupPassword !== signupConfirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  try {
    const data = await signup({
      username: signupUsername,
      email: signupEmail,
      password: signupPassword,
    });
    console.log('Signup success:', data);
    
  // Clear signup fields
  setSignupUsername('');
  setSignupEmail('');
  setSignupPassword('');
  setSignupConfirmPassword('');

  // Show login modal
  setSignupModalVisible(false);
  setModalVisible(true);
  } catch (err) {
    console.error('Signup failed:', err);
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
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}</View>
      {/* Login Modal */}
      <Modal
        //bg="rgba(244,243,243,0.6)"
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
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
              placeholder="User Name"
              placeholderTextColor="#999"
              value={loginUsername}
              onChangeText={setLoginUsername}
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
              onPress = {handleLogin}
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
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SignUp Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isSignupModalVisible}
        onRequestClose={() => setSignupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.signupModal]}>
            <View style={styles.tabs}>
              <Text style={styles.tabText}>Sign Up</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="User Name"
              placeholderTextColor="#999"
              value={signupUsername}
              onChangeText={setSignupUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={signupEmail}
              onChangeText={setSignupEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={signupPassword}
              onChangeText={setSignupPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={signupConfirmPassword}
              onChangeText={setSignupConfirmPassword}
            />

            <TouchableOpacity style={styles.authButton} onPress={handleSignup}>
              <Text style={styles.authText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSignupModalVisible(false);
                setModalVisible(true);
              }}
            >
              <Text style={styles.loginSwitchText}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
