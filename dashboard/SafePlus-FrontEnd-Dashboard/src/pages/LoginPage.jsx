import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Input, FormControl, FormLabel, VStack, Text, Link, Image, Heading } from "@chakra-ui/react";

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with:", formData);
  
    // Dummy authentication check
    if (formData.username === "admin" && formData.password === "1234") {
      navigate("/home");
    } else {
      alert("Invalid credentials!");
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
            <FormControl id="username">
              <FormLabel color="#ABAAAA">User Name</FormLabel>
              <Input
                type="text"
                name="username"
                value={formData.username}
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
