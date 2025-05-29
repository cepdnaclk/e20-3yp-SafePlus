import  { useState } from 'react';
import Header from "../components/Header/Header";
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Text,
  Icon,
  Button,
} from '@chakra-ui/react';
import { MdLogout, MdSecurity } from 'react-icons/md';
import { FaBell, FaSlidersH } from 'react-icons/fa';
import { BiUserCircle } from 'react-icons/bi';

import AccountDetails from '../components/settings/AccountDetails';
import '../styles/Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const navigate = useNavigate(); 

  const tabList = [
    { key: 'account', label: 'Account', icon: BiUserCircle },
    { key: 'notifications', label: 'Notifications', icon: FaBell },
    { key: 'security', label: 'Security', icon: MdSecurity },
    { key: 'advanced', label: 'Advanced settings', icon: FaSlidersH },
    { key: 'logout', label: 'logout', icon: MdLogout },
  ];

  const handleLogout = () => {
    // Clear localStorage or cookies if needed
    localStorage.removeItem('token');
    // Redirect to login
    navigate('/login');
  };

  const renderContent = () => {
    if (activeTab === 'account') return <AccountDetails />;
    return <Box p={4}>Coming Soon: {activeTab}</Box>;
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
                  tab.key === 'logout' ? handleLogout() : setActiveTab(tab.key)
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
    </>
  );
};

export default Settings;
