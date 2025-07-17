import { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Heading,
  HStack,
  Button,
  Input,
  VStack,
  Divider
} from '@chakra-ui/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../../styles/Settings.css';

const API_URL = import.meta.env.VITE_API_URL;

const AccountDetails = () => {
  const [details, setDetails] = useState({
    name: '',
    username: '',
    email: ''
  });

  const [editMode, setEditMode] = useState({
    name: false,
    username: false,
    email: false
  });

  const [tempDetails, setTempDetails] = useState(details);

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/profile`, { withCredentials: true });

      if (res.data) {
        setDetails({
          name: res.data.fname || '',
          username: res.data.name || '',
          email: res.data.email || ''
        });
        setTempDetails({
          name: res.data.fname || '',
          username: res.data.name || '',
          email: res.data.email || ''
        });
      } else {
        console.log("Not logged in or no data");
        toast.error("Not logged in");
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
      toast.error("Failed to load account details");
    }
  };

  fetchProfile();
}, []);


 

  const handleEdit = (field) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleChange = (field, value) => {
    setTempDetails({ ...tempDetails, [field]: value });
  };

  const saveChanges = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/auth/profile`, {
        fname: tempDetails.name,
        name: tempDetails.username,
        email: tempDetails.email,
      }, { withCredentials: true });

      if (res.status === 200) {
        setDetails(tempDetails);
        setEditMode({ name: false, username: false, email: false });
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    }
  };

  const undoChanges = () => {
    setTempDetails(details);
    setEditMode({ name: false, username: false, email: false });
  };

  const renderField = (label, field) => (
    <HStack justifyContent="space-between" py={2}>
      <Text fontWeight="medium">{label}</Text>
      <HStack spacing={6}>
        {editMode[field] ? (
          <Input
            size="sm"
            value={tempDetails[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            w="250px"
          />
        ) : (
          <Text color="gray.600">{details[field]}</Text>
        )}
        <Button size="sm" variant="link" onClick={() => handleEdit(field)}>
          edit
        </Button>
      </HStack>
    </HStack>
  );

  return (
    <Box className="account-box">
      <Heading size="md" className="account-heading">Account</Heading>
      <Divider className="account-divider" />

      <VStack spacing={3} align="stretch">
        {renderField('Full Name', 'name')}
        {renderField('Username', 'username')}
        {renderField('Email', 'email')}
      </VStack>

      <HStack justifyContent="flex-end" mt={6}>
        <Button variant="link" onClick={undoChanges} color="gray.600">
          undo changes
        </Button>
        <Button colorScheme="yellow" onClick={saveChanges}>
          save preferences
        </Button>
      </HStack>
    </Box>
  );
};

export default AccountDetails;
