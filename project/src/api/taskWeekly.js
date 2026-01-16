const API_URL = 'http://localhost:3000/api';

export async function getWeeklyTasks(token, startDate, endDate) {
  const response = await fetch(`${API_URL}/tasks/weekly?start=${startDate}&end=${endDate}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch weekly tasks');
  }

  return response.json();
}

export async function getTasksByDate(token, date) {
  const response = await fetch(`${API_URL}/tasks/date/${date}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch tasks for date');
  }

  return response.json();
}