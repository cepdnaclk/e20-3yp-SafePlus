import { BrowserRouter as Router, Routes, Route,Navigate } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import LoginPage from './pages/LoginPage';
import SignupPage from "./pages/SignupPage";
import LiveData from "./pages/LiveData";
import WorkerDetails from "./pages/WorkerDetails";
import AssignedWorkersPage from "./pages/AssignedWorkersPage";
import Reports from "./pages/Reports";
import axios from 'axios';
import {Toaster} from 'react-hot-toast'
import { UserContextProvider } from "../context/userContext";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import { NotificationProvider } from "./context/NotificationContext";


axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials= true

const App = () => {
  return (
    <NotificationProvider>
    <UserContextProvider>
    <ChakraProvider>
      <Toaster position="top-middle" toastOptions={{duration:4000}}/>
      <Router>
        <Routes>

         <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />


          <Route path="/livedata" element={<LiveData />} />
          <Route path="/workerdetails" element={<WorkerDetails />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assigned-workers" element={<AssignedWorkersPage />} />


        </Routes>
      </Router>
    </ChakraProvider>
    </UserContextProvider>
    </NotificationProvider>
  );
};

export default App;
