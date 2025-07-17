import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  title: {
    marginTop: 50,
    fontSize: 60,
    fontWeight: 'bold',
    color: 'rgb(240,214,166)',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  loginButton: {
    backgroundColor: '#F1C35E',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 30,
    elevation: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    transform: [{ scale: 1.05 }],
  },
  loginButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#F1C35E',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    transform: [{ scale: 1.05 }],
  },
  signupButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
  backgroundColor: 'rgba(244,243,243,0.6)',
  borderRadius: 20,
  width: '90%',
  padding: 32,
  borderWidth: 2,
  borderColor: '#BDBDBD',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 10,
},
signupModal: {
  paddingVertical: 32,
},
  tabs: {
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 15,
  position: 'relative',
},

tabText: {
  fontWeight: 'bold',
  fontSize: 30,
  color: '#000',
  textAlign: 'center',
},

closeBtn: {
  position: 'absolute',
  right: -15,
  top: -30,
  padding: 10,
},

closeButtonText: {
  fontSize: 30,
  color: '#800517',
},

  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginVertical: 8,
    padding: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
   
    
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleText: {
    color: '#444',
  },
  authButton: {
    marginTop: 12,
    backgroundColor: '#F1C35E',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    transform: [{ scale: 1.05 }],
  },
  authText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  loginSwitchText: {
    color: '#000',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default styles;