const BASE_URL = 'http://10.30.0.231:8000/api/mobile'; // replace with your IP

export const signup = async ({ username, email, password }) => {
  print('Signing up with:', { username, email, password });
  try {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    return await response.json();
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

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
