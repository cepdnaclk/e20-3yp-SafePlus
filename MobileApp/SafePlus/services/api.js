
const BASE_URL = 'http://10.40.19.196:8000/api/workers'; // replace with your IP



// Api callfor mobile app login
export const login = async ({ email, password }) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data =  await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const fetchUserData = async (userId) => {
  console.log('Fetching user data for ID:', userId);
  try {
    const response = await fetch(`${BASE_URL}/data/${userId}`);
    console.log('User data fetched successfully:', response);
    return await response.json();
    
  } catch (error) {
    console.error('Fetch user data error:', error);
    throw error;
  }
};

// Api call for changing password
export const changePassword = async ({ userId, newPassword }) => {
  try {
    const response = await fetch(`${BASE_URL}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Password update failed');
    return data;
  } catch (err) {
    throw err;
  }
};

// Fetch helmet data in hourly for the mobile app
export const fetchHourlyStats = async (helmetId) => {
  //helmetId = "Helmet_1";
 // console.log('helmetID :', ) 
 helmetId = helmetId || "Helmet_1"; // Default to Helmet_1 if no ID is provided
  console.log('Fetching hourly stats for helmet ID:', helmetId);
  try {
    console.log('Fetching hourly stats for helmet ID:', helmetId);
    const response = await fetch(`${BASE_URL}/hourly-stats/${helmetId}`);
    if (!response.ok) throw new Error('Failed to fetch hourly stats');
    return await response.json();
  } catch (error) {
    console.error('Fetch hourly stats error:', error);
    throw error;
  }
};

import axios from 'axios';


