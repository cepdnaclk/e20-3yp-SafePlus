
import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
  },
  welcome: {
    fontSize: 30,
    textAlign: 'center',
    marginHorizontal: 20, // adds horizontal spacing
    marginBottom: 50,
    flexWrap: 'wrap',
  },
  bold: {
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#555',
  },
  accountIcon: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  notificationIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  icon: {
    fontSize: 20,
  },
});

export default styles;