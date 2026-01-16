const API_URL = 'http://localhost:3000/api';

export async function startPomodoroSession(token, mode, duration, taskId) {
  const response = await fetch(`${API_URL}/pomodoro/start`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      mode,
      duration,
      taskId
    })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to start pomodoro session');
  }

  return response.json();
}

export async function pausePomodoroSession(token) {
  const response = await fetch(`${API_URL}/pomodoro/pause`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to pause pomodoro session');
  }

  return response.json();
}

export async function resumePomodoroSession(token) {
  const response = await fetch(`${API_URL}/pomodoro/resume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to resume pomodoro session');
  }

  return response.json();
}

export async function completePomodoroSession(token) {
  const response = await fetch(`${API_URL}/pomodoro/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to complete pomodoro session');
  }

  return response.json();
}

export async function getCurrentPomodoroSession(token) {
  const response = await fetch(`${API_URL}/pomodoro/current`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to get current pomodoro session');
  }

  return response.json();
}

export async function getPomodoroHistory(token, filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  const url = `${API_URL}/pomodoro/history${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to get pomodoro history');
  }

  return response.json();
}