import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, FormControl, FormLabel, VStack, Text, Link, Image, Heading } from "@chakra-ui/react";
import axios from 'axios';
import {toast } from 'react-hot-toast';


const LoginPage = () => {
  const [formData, setFormData] = useState({ name: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {name,password}= formData
    try {
      const {data} = await axios.post('/login', {
        name,
        password
      });

      // Store token and username after successful login
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);

      if(data.error){
        toast.error(data.error)
      } else{
        setFormData({})
        navigate('/livedata')
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
          
    }
    
    //validation
    if (!name || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Dummy authentication check
    //if (formData.username === "admin" && formData.password === "1234") {
    //  navigate("/home");
    //} else {
    //  alert("Invalid credentials!");
    //}
  };
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgImage="/assets/bg.jpg"
      bgSize="cover"
      bgPosition="center"
    >
      {/* Login Box */}
      <Box
        bg="rgba(244, 243, 243, 0.6)"
        p={8}
        borderRadius="20px"
        border="2px solid #BDBDBD"
        backdropFilter="blur(10px)"
        width={{ base: "90%", md: "500px" }}
        boxShadow="lg"
      >
        <VStack spacing={4}>
          {/* Logo */}
          <Image src="/assets/logo.webp" boxSize="100px" />

          {/* Title */}
          <Heading fontSize="2xl" color="#361717">
            Login
          </Heading>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <FormControl id="name">
              <FormLabel color="#4d4b48">User Name</FormLabel>
              <Input
                type="text"
                name="name"
                value={formData.username}
                onChange={handleChange}
                bg="white"
                borderRadius="md"
              />
            </FormControl>

            <FormControl id="password" mt={4}>
              <FormLabel color="#4d4b48">Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                bg="white"
                borderRadius="md"
              />
            </FormControl>

            {/* Forgot Password */}
            <Text fontSize="sm" mt={2} color="#361717">
              <Link href="#">Forgot Password?</Link>
            </Text>

            {/* Buttons */}
            <VStack mt={6} spacing={3}>
              <Button type="submit" bg="#F1C35E" color="black" width="full">
                Login
              </Button>
              
              <Button bg="#E7D4AB" color="black" width="full" onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};

export default LoginPage;
