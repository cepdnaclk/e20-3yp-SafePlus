import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity,Image } from "react-native";

const HomeScreen = () => {
  const navigation = useNavigation(); 

  return (
    <View style={styles.container}>
        <Image source={require("C:/Users/Saku/Documents/GitHub/e20-3yp-SafePlus/MobileApp/SafePlus/assets/logo.png")} style ={styles.image}/>
      <Text style={styles.text}>
        Welcome to the SafePlus Home Page! You Can See Your Sensor Data from Here
      </Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate("Data")}
      >
        <Text style={styles.buttonText}>Sensor Data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: "#f0f8ff", flex: 1, justifyContent: "center", alignItems: "center" },
  image: {
    width: 200,  // Adjust width
    height: 200, // Adjust height
    marginBottom: 20, // Space between image and text
  },
  text: { fontSize: 20,  textAlign: "center", marginBottom: 20 ,paddingVertical:50},
  button: {
    backgroundColor: "#1E90FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default HomeScreen;
