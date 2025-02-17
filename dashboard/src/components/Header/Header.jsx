import React from 'react';
import { Tabs, TabList, Tab, Box, Flex, Spacer, IconButton } from '@chakra-ui/react';
import { SettingsIcon } from '@chakra-ui/icons';
import './Header.scss';

function Header() {
  return (
    <Box className="header-container">
      <Flex align="center" width="100%">
        <Tabs variant="unstyled" className="header-tabs">
          <TabList>
            <Tab className="header-tab">Dashboard</Tab>
            <Tab className="header-tab">Workers</Tab>
            <Tab className="header-tab">Reports</Tab>
          </TabList>
        </Tabs>

        <Spacer />

        <IconButton
          aria-label="Settings"
          icon={<SettingsIcon />}
          variant="ghost"
          className="settings-icon"
        />
      </Flex>
    </Box>
  );
}

export default Header;
