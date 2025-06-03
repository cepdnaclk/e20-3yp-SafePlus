// styles/UserAccountScreen.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backArrow: {
    fontSize: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    marginBottom: 5,
  },
  helmetNo: {
    fontSize: 16,
    marginBottom: 20,
  },
  subTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  helmetBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  helmetItem: {
    fontSize: 14,
    marginVertical: 2,
  },
  button: {
    backgroundColor: '#FFD966',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  // ...existing code...
  selectedHelmet: {
    backgroundColor: '#5d4b1f',
    borderRadius: 8,
    padding: 8,
    marginVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    elevation: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d7c49d',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f6ef',
  },

});
