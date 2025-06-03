import React, { createContext, useState, useEffect } from 'react';
import { fetchHourlyStats } from '../services/api';

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [hourlyStats, setHourlyStats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(true);

  console.log('UserContext initialized with user:', user);

  useEffect(() => {
    console.log('UserContext useEffect triggered', user);
    if (user?.helmetID) {
      console.log('Fetching hourly stats for helmet ID:', user.helmetID);
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
      if (e.hourWindowStart?.split('T')[0] === today&&e.helmetId === user?.helmetID) {
        const tempF = (e.avgTemp * 9) / 5 + 32;
        const hi =
          -42.379 + 2.04901523 * tempF + 10.14333127 * e.avgHum
          - 0.22475541 * tempF * e.avgHum - 0.00683783 * tempF * tempF
          - 0.05481717 * e.avgHum * e.avgHum
          + 0.00122874 * tempF * tempF * e.avgHum
          + 0.00085282 * tempF * e.avgHum * e.avgHum
          - 0.00000199 * tempF * tempF * e.avgHum * e.avgHum;
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
        message: `⚠️ You have been in high dehydration risk for ${high} hour(s) today. Drink more water during your work!`
      });
    }
    if (moderate > 0) {
      newNotifications.push({
        id: 'moderate',
        message: `🟠 You have been in moderate dehydration risk for ${moderate} hour(s) today. Please hydrate during your work!.`
      });
    }
    if (impact > 0) {
  newNotifications.push({
    id: 'impact',
    type: 'emergency', // you can use this in your UI for styling
    message: `🚨 SEVERE HEAD IMPACT DETECTED! 🚨\n\nYou may be at risk of concussion or other serious injury. 
    Symptoms can include dizziness, headache, confusion, nausea, or loss of consciousness. 
    Please seek immediate medical attention and do not continue working until cleared by a professional.`
  });

    }
    setNotifications(newNotifications);
    setUnread(newNotifications.length > 0); // Mark as unread if there are notifications
  }, [hourlyStats, user?.helmetID]);

  // Function to mark notifications as read
  const markNotificationsRead = () => setUnread(false);

  // Function to delete a notification
  const deleteNotification = (id) => {
    setNotifications(notifications => notifications.filter(n => n.id !== id));
  };


  return (
    <UserContext.Provider value={{
      user, setUser, hourlyStats,
      notifications, unread,
      markNotificationsRead, deleteNotification
    }}>
      {children}
    </UserContext.Provider>
  );
};