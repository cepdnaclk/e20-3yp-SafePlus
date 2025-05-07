import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, FormControl, FormLabel, VStack, Image, Heading } from "@chakra-ui/react";
import axios from 'axios';
import {toast} from 'react-hot-toast';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  //const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    // Password match validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post('/register', {name, email, password });
      const data = res.data;

      if (data.error) {
        toast.error(data.error);
      } else {
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        toast.success('Signup Successful, Welcome!');
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Dummy signup success
    //console.log("Signing up with:", formData);
    //setError("");
    //navigate("/"); 
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
      {/* Signup Box */}
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
            Sign Up
          </Heading>

          {/* Error Message */}
          {/*error && <Text color="red.500">{error}</Text>*/}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <FormControl id="name">
            <FormLabel color="#ABAAAA">User Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              bg="white"
              borderRadius="md"
            />
          </FormControl>



            <FormControl id="email" mt={4}>
              <FormLabel color="#ABAAAA">Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                bg="white"
                borderRadius="md"
              />
            </FormControl>

            <FormControl id="password" mt={4}>
              <FormLabel color="#A8A6A6">Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                bg="white"
                borderRadius="md"
              />
            </FormControl>

            <FormControl id="confirmPassword" mt={4}>
              <FormLabel color="#A8A6A6">Confirm Password</FormLabel>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                bg="white"
                borderRadius="md"
              />
            </FormControl>

            {/* Buttons */}
            <VStack mt={6} spacing={3}>
              <Button type="submit" bg="#F1C35E" color="black" width="full">
                Sign Up
              </Button>
              <Button bg="#E7D4AB" color="black" width="full" onClick={() => navigate("/login")}>
                Already have an account? Login
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};

export default SignupPage;
