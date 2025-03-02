import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import SignupPage from "./pages/SignupPage";
const App = () => {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/home" element={<Home />} />

        </Routes>
      </Router>
    </ChakraProvider>
  );
};

export default App;
