import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import SignupPage from "./pages/SignupPage";
import LiveData from "./pages/LiveData";
import WorkerDetails from "./pages/WorkerDetails";
import Reports from "./pages/Reports";
const App = () => {
  return (
    <ChakraProvider>
      <Router>
        <Routes>

         <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/home" element={<Home />} />

          <Route path="/livedata" element={<LiveData />} />
          <Route path="/workerdetails" element={<WorkerDetails />} />
          <Route path="/reports" element={<Reports />} />


        </Routes>
      </Router>
    </ChakraProvider>
  );
};

export default App;
