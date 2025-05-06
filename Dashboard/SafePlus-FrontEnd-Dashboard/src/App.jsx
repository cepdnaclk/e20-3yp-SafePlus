import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import SignupPage from "./pages/SignupPage";
import LiveData from "./pages/LiveData";
import WorkerDetails from "./pages/WorkerDetails";
import Reports from "./pages/Reports";
import axios from 'axios';
import {Toaster} from 'react-hot-toast'
import { UserContextProvider } from "../context/userContext";
import Dashboard from "./pages/Dashboard";

axios.defaults.baseURL =  'http://localhost:8000'
axios.defaults.withCredentials= true

const App = () => {
  return (
    <UserContextProvider>
    <ChakraProvider>
      <Toaster position="top-middle" toastOptions={{duration:4000}}/>
      <Router>
        <Routes>

         <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/home" element={<Home />} />

          <Route path="/livedata" element={<LiveData />} />
          <Route path="/workerdetails" element={<WorkerDetails />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/dashboard" element={<Dashboard />} />


        </Routes>
      </Router>
    </ChakraProvider>
    </UserContextProvider>
  );
};

export default App;
