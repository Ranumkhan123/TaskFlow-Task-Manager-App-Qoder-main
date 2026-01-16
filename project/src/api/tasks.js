const API_URL = 'http://localhost:3000/api';

export async function getTasks(token, filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);

  const url = `${API_URL}/tasks${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch tasks');
  }

  return response.json();
}

export async function getTaskStats(token) {
  const response = await fetch(`${API_URL}/tasks/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch stats');
  }

  return response.json();
}

export async function getTask(token, id) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch task');
  }

  return response.json();
}

export async function createTask(token, taskData) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create task');
  }

  return data;
}

export async function updateTask(token, id, taskData) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update task');
  }

  return data;
}

export async function deleteTask(token, id) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete task');
  }

  return data;
}
