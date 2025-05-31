const BASE_URL = 'http://10.40.19.169:8000/api/workers'; // replace with your IP


// Api callfor mobile app login
export const login = async ({ email, password }) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    return await response.json();
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
export const changePassword = async ({ email, newPassword }) => {
  try {
    const response = await fetch(`${BASE_URL}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Password update failed');
    return data;
  } catch (err) {
    throw err;
  }
};

// Add more mobile API calls here (fetchHelmetData, updateProfile, etc.)
