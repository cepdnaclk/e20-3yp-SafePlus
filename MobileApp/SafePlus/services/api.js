
const BASE_URL = 'http://10.30.8.182:8000/api/workers'; // replace with your IP



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

// Fetch helmet data for the mobile app
export const fetchHelmetData = async (userId) => {
  const HelmetId = "Helmet_1";
  try {
    
    const response = await fetch(`${BASE_URL}/fetchHelmetData${HelmetId}`);
    if (!response.ok) throw new Error('Failed to fetch helmet data');
    return await response.json();
  } catch (error) {
    console.error('Fetch helmet data error:', error);
    throw error;
  }
};
