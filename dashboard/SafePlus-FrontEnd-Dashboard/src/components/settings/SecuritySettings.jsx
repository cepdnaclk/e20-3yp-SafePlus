import {
  Box,
  Heading,
  VStack,
  Divider,
  Text,
  Switch,
  Flex,
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

const SecuritySettings = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const handle2FAToggle = () => {
    setIs2FAEnabled(prev => !prev);
  };

const [loginHistory, setLoginHistory] = useState([]);

useEffect(() => {
  const fetchLoginActivity = async () => {
    try {
      const res = await axios.get('http://localhost:8000/login-activities', {
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

      {/* Two-Factor Auth Section */}
      <VStack spacing={4} align="stretch" mt={2} mb={6}>
        <Text fontWeight="medium">Two-Factor Authentication (2FA)</Text>
        <Flex align="center" justify="space-between">
          <Text fontSize="sm" color="gray.600">
            Add an extra layer of security to your account.
          </Text>
          <Switch colorScheme="teal" isChecked={is2FAEnabled} onChange={handle2FAToggle} />
        </Flex>
      </VStack>

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
