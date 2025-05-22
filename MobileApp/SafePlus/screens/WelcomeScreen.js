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
import { BlurView } from 'expo-blur';
import styles from '../styles/WelcomeScreen';

export default function WelcomeScreen({ navigation }) {
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [isSignupModalVisible, setSignupModalVisible] = React.useState(false);
  const [signupUsername, setSignupUsername] = React.useState('');
  const [signupEmail, setSignupEmail] = React.useState('');
  const [signupPassword, setSignupPassword] = React.useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = React.useState('');
  const [loginUsername, setLoginUsername] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');

  const onClose = () => {
    setModalVisible(false);
    setSignupModalVisible(false);
  };

  const handleSignup = () => {
    if (!signupUsername || !signupEmail || !signupPassword || !signupConfirmPassword) {
      alert('Please fill all the fields.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    console.log('SignUp Data:', {
      username: signupUsername,
      email: signupEmail,
      password: signupPassword,
    });

    // Clear signup fields
    setSignupUsername('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');

    // Show login modal
    setSignupModalVisible(false);
    setModalVisible(true);
  };

  return (
    <ImageBackground
      source={require('../assets/background2.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.fullScreenOverlay} />
      <View style={styles.contentContainer}>
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
      </View>

      {/* Login Modal */}
      <Modal
        bg="rgba(244,243,243,0.6)"
        backdropFilter="blur(10px)"
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView
            style={styles.modalContainer}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(244,243,243,0.6)"
            >
            <View style={styles.tabs}>
              <Text style={styles.tabText}>Log In</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeButtonText}>Close</Text>
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
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.authText}>Login</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>

      {/* SignUp Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSignupModalVisible}
        onRequestClose={() => setSignupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.signupModal]}>
            <View style={styles.tabs}>
              <Text style={styles.tabText}>Sign Up</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeButtonText}>Close</Text>
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
