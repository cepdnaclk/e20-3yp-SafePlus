import { useState, useRef } from 'react';
import Header from "../components/Header/Header";
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Text,
  Icon,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { MdLogout, MdSecurity } from 'react-icons/md';
import { FaBell, FaSlidersH } from 'react-icons/fa';
import { BiUserCircle } from 'react-icons/bi';

import AccountDetails from '../components/settings/AccountDetails';
import '../styles/Settings.css';
import AdvancedSetting from '../components/settings/AdvancedSetting';
import SecuritySettings from '../components/settings/SecuritySettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const tabList = [
    { key: 'account', label: 'Account', icon: BiUserCircle },
    { key: 'notifications', label: 'Notifications', icon: FaBell },
    { key: 'security', label: 'Security', icon: MdSecurity },
    { key: 'advanced', label: 'Advanced settings', icon: FaSlidersH },
    { key: 'logout', label: 'logout', icon: MdLogout },
  ];

  const confirmLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountDetails />;
      case 'security':
      return <SecuritySettings />;
      case 'advanced':
        return <AdvancedSetting />;
      default:
        return <Box p={4}>Coming Soon: {activeTab}</Box>;
    }
  };

  return (
    <>
      <Header />
      <div className="settings-container">
        <div className="sidebar">
          <Text className="sidebar-title">Settings</Text>
          <VStack align="stretch" spacing={3}>
            {tabList.map(tab => (
              <Button
                key={tab.key}
                onClick={() =>
                  tab.key === 'logout' ? onOpen() : setActiveTab(tab.key)
                }
                className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                leftIcon={<Icon as={tab.icon} boxSize={5} />}
              >
                {tab.label}
              </Button>
            ))}
          </VStack>
        </div>

        <div className="content-box">
          {renderContent()}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Logout
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to log out?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                No
              </Button>
              <Button colorScheme="red" onClick={confirmLogout} ml={3}>
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Settings;
