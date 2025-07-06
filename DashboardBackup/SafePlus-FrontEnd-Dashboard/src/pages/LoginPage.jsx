import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, FormControl, FormLabel, VStack, Text, Link, Image, Heading } from "@chakra-ui/react";
import axios from 'axios';
import {toast } from 'react-hot-toast';


const LoginPage = () => {
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [twoFAStage, setTwoFAStage] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [totp, setTotp] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {name,password}= formData;
    
    //validation
    if (!name || !password) {
    toast.error("Please fill in all fields");
    return;
  }

  try {
    const { data } = await axios.post(`${API_URL}/api/auth/login`, { name, password });

    if (data.error) {
      toast.error(data.error);
    } else if (data.requires2FA) {
      setTwoFAStage(true);
      setTempUserId(data.userId);
    } else {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      navigate("/livedata");
    }
  } catch (err) {
    console.error('Login Failed', err);
    toast.error("Login failed");
  }
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
                value={formData.name}
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
            {twoFAStage && (
              <FormControl id="totp" mt={4}>
              <FormLabel color="#4d4b48">Enter 6-digit Code</FormLabel>
              <Input
                type="text"
                name="totp"
                value={totp}
                onChange={(e) => setTotp(e.target.value)}
                bg="white"
                borderRadius="md"
              />
              <Button
                mt={4}
                bg="#F1C35E"
                color="black"
                onClick={async () => {
                  try {
                    const { data } = await axios.post(`${API_URL}/api/auth/verify-2fa`, {
                      userId: tempUserId,
                      totpCode: totp,
                    });
          
                    if (data.success) {
                      localStorage.setItem("token", data.token);
                      localStorage.setItem("username", data.username);
                      navigate("/livedata");
                    } else {
                      toast.error(data.error || "Invalid 2FA code");
                    }
                  } catch (err) {
                    console.error('2FA verification failed', err);
                    toast.error("2FA verification failed");
                  }
                }}
              >
                Verify Code
              </Button>
            </FormControl>
            )}


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
