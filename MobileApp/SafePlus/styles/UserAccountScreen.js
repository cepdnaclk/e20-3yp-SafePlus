import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfbe9', padding: 20 },
  title: { fontSize: 30, fontWeight: 'bold',position:'absolute',top:70,left:20 },
  subTitle: { marginTop: 3, fontWeight: 'bold' ,fontSize: 20 , textAlign: 'center'},
  helmetBox: { backgroundColor: '#fff6c1', padding: 10, marginVertical: 80,marginHorizontal:30, borderRadius: 25 ,shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5, },
  button: { backgroundColor: '#f0e68c', padding: 12, borderRadius: 30, marginVertical: 15,marginHorizontal:45, alignItems: 'center',shadowColor: '#000',
    
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5, },
  backButton: { position: 'absolute', top: 40, left: 20 },
  email: { fontSize: 17,
     marginTop: 100 },
    helmetNo: { fontSize: 17, marginTop: 10 },
});

export default styles;