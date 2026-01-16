const API_URL = 'http://localhost:3000/api';

export async function updateUser(token, userData) {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update user');
  }

  return data;
}