import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fef6e4',
  },
  container: {
    padding: 20,
    //alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  highlight: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom:20,
  },
  instruction: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  footerNote: {
    marginTop: 20,
    fontStyle: 'italic',
    color: '#444',
  },
  bold: {
  fontWeight: 'bold',
  fontFamily: 'sans-serif-medium',
  },
  
},
);
