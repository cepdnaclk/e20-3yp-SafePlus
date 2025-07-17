import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchHourlyStats } from '../services/api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hourlyStats, setHourlyStats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user from AsyncStorage:', error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (user?.helmetID) {
      fetchHourlyStats(user.helmetID)
        .then(setHourlyStats)
        .catch(() => setHourlyStats([]));
    } else {
      setHourlyStats([]);
    }
  }, [user?.helmetID]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    let high = 0, moderate = 0, impact = 0;
    hourlyStats.forEach(e => {
      if (e.hourWindowStart?.split('T')[0] === today && e.helmetId === user?.helmetID) {
        const tempF = (e.avgTemp * 9) / 5 + 32;
        const hi =
          -42.379 + 2.04901523 * tempF + 10.14333127 * e.avgHum
          - 0.22475541 * tempF * e.avgHum - 0.00683783 * tempF ** 2
          - 0.05481717 * e.avgHum ** 2 + 0.00122874 * tempF ** 2 * e.avgHum
          + 0.00085282 * tempF * e.avgHum ** 2 - 0.00000199 * tempF ** 2 * e.avgHum ** 2;

        const hiC = ((hi - 32) * 5) / 9;
        if (hiC > 40) high++;
        else if (hiC > 35) moderate++;
        if (e.impactCount && e.impactCount > 0) impact += e.impactCount;
      }
    });

    const newNotifications = [];
    if (high > 0) {
      newNotifications.push({
        id: 'high',
        message: `⚠️ High dehydration risk for ${high} hour(s) today. Drink water!`
      });
    }
    if (moderate > 0) {
      newNotifications.push({
        id: 'moderate',
        message: `🟠 Moderate dehydration risk for ${moderate} hour(s). Stay hydrated!`
      });
    }
    if (impact > 0) {
      newNotifications.push({
        id: 'impact',
        type: 'emergency',
        message: `🚨 SEVERE HEAD IMPACT DETECTED! Please seek immediate medical attention.`
      });
    }

    setNotifications(newNotifications);
    setUnread(newNotifications.length > 0);
  }, [hourlyStats, user?.helmetID]);

  const logout = async () => {
    try {
      console.log('Logging out...');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      console.log('Logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const markNotificationsRead = () => setUnread(false);
  const deleteNotification = (id) =>
    setNotifications(notifications => notifications.filter(n => n.id !== id));

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      logout,
      hourlyStats,
      notifications,
      unread,
      markNotificationsRead,
      deleteNotification
    }}>
      {children}
    </UserContext.Provider>
  );
};
