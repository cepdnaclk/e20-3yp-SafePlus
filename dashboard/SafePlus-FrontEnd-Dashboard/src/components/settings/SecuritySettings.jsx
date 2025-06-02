import {
  Box,
  Heading,
  Divider,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import '../../styles/Settings.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import TwoFactorSettings from './TwoFactorSettings'; // Adjust path as needed

const SecuritySettings = () => {
  const [loginHistory, setLoginHistory] = useState([]);

  useEffect(() => {
    const fetchLoginActivity = async () => {
      try {
        const res = await axios.get('/api/auth/login-activities', {
          withCredentials: true,
        });
        setLoginHistory(res.data);
      } catch (err) {
        console.error('Error fetching login activity:', err);
      }
    };

    fetchLoginActivity();
  }, []);

  return (
    <Box className="account-box">
      <Heading size="md" className="account-heading">Security Settings</Heading>
      <Divider className="account-divider" />

      {/* Two-Factor Authentication Settings */}
      <Box mt={4} mb={6}>
        <TwoFactorSettings />
      </Box>

      <Divider className="account-divider" />

      {/* Login Activity Section */}
      <Box mt={4}>
        <Text fontWeight="medium" mb={2}>Recent Login Activity</Text>
        <Table variant="simple" size="sm" bg="white" borderRadius="md" overflow="hidden">
          <Thead bg="#f1e6cf">
            <Tr>
              <Th>Date & Time</Th>
              <Th>IP Address</Th>
              <Th>Device</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loginHistory.map((entry, index) => (
              <Tr key={index}>
                <Td>{new Date(entry.timestamp).toLocaleString()}</Td>
                <Td>{entry.ip}</Td>
                <Td>{entry.userAgent}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default SecuritySettings;
