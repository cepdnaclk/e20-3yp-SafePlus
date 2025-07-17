import { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Divider,
  Input,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import '../../styles/Settings.css';

// ✅ Use environment variable
const API_URL = import.meta.env.VITE_API_URL;

const AdvancedSetting = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [deleteCreds, setDeleteCreds] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleDeleteCredsChange = (e) => {
    setDeleteCreds({ ...deleteCreds, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      const res = await axios.put(
        `${API_URL}/api/auth/change-password`, // ✅ FIXED double slash too
        { currentPassword, newPassword },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success('Password changed successfully');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to change password');
    }
  };

  const handleConfirmDelete = async () => {
    const { username, password } = deleteCreds;

    if (!username || !password) {
      toast.error('Please fill in both username and password');
      return;
    }

    try {
      const res = await axios.delete(`${API_URL}/api/auth/delete-account`, {
        data: { username, password },
        withCredentials: true,
      });

      if (res.status === 200) {
        toast.success('Account deleted');
        localStorage.removeItem('token');
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete account');
    }
  };

  return (
    <Box className="account-box">
      <Heading size="md">Advanced Settings</Heading>
      <Divider className="account-divider" />

      <VStack spacing={4} align="stretch" mt={4}>
        <Text fontWeight="medium">Change Password</Text>
        <Input
          name="currentPassword"
          placeholder="Current Password"
          type="password"
          value={passwords.currentPassword}
          onChange={handleChange}
        />
        <Input
          name="newPassword"
          placeholder="New Password"
          type="password"
          value={passwords.newPassword}
          onChange={handleChange}
        />
        <Input
          name="confirmPassword"
          placeholder="Confirm New Password"
          type="password"
          value={passwords.confirmPassword}
          onChange={handleChange}
        />
        <Button colorScheme="yellow" onClick={handleChangePassword}>
          Change Password
        </Button>
      </VStack>

      <Divider my={6} />

      <Box mt={4}>
        <Text fontWeight="medium" color="red.500">Danger Zone</Text>
        <Button colorScheme="red" onClick={onOpen} mt={2}>Delete Account</Button>
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Account Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>Please enter your credentials to confirm deletion:</Text>
            <Input
              name="username"
              placeholder="Username"
              value={deleteCreds.username}
              onChange={handleDeleteCredsChange}
              mb={2}
            />
            <Input
              name="password"
              placeholder="Password"
              type="password"
              value={deleteCreds.password}
              onChange={handleDeleteCredsChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>Cancel</Button>
            <Button colorScheme="red" onClick={() => { handleConfirmDelete(); onClose(); }}>
              Confirm Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvancedSetting;
