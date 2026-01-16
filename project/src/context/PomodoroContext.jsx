import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  startPomodoroSession,
  pausePomodoroSession,
  resumePomodoroSession,
  completePomodoroSession,
  getCurrentPomodoroSession
} from '../api/pomodoro';

const PomodoroContext = createContext();

export function usePomodoro() {
  return useContext(PomodoroContext);
}

export function PomodoroProvider({ children }) {
  const { token } = useAuth();
  const [pomodoroState, setPomodoroState] = useState({
    isRunning: false,
    mode: 'focus', // 'focus' or 'break'
    remainingTime: 25 * 60, // 25 minutes in seconds
    totalDuration: 25 * 60,
    lastTickTimestamp: null,
    sessionId: null,
    status: 'idle' // idle, running, paused
  });

  // Load initial state from backend when component mounts
  useEffect(() => {
    if (token) {
      loadCurrentSession();
    }
  }, [token]);

  // Load current session from backend
  const loadCurrentSession = async () => {
    try {
      const session = await getCurrentPomodoroSession(token);
      
      if (session) {
        // Calculate remaining time based on server data
        const calculatedRemainingTime = Math.max(0, session.remainingTime);
        
        setPomodoroState(prev => ({
          ...prev,
          isRunning: session.isRunning,
          mode: session.mode,
          remainingTime: calculatedRemainingTime,
          totalDuration: session.duration,
          lastTickTimestamp: session.isRunning ? Date.now() : null,
          sessionId: session.id,
          status: session.status
        }));

        // If session is running, start the timer
        if (session.isRunning) {
          startTimer();
        }
      }
    } catch (error) {
      console.error('Error loading current pomodoro session:', error);
    }
  };

  // Timer interval
  useEffect(() => {
    let interval = null;
    
    if (pomodoroState.isRunning && pomodoroState.remainingTime > 0) {
      interval = setInterval(() => {
        setPomodoroState(prev => {
          const now = Date.now();
          const timePassed = Math.floor((now - (prev.lastTickTimestamp || now)) / 1000);
          const newRemainingTime = Math.max(0, prev.remainingTime - timePassed);
          
          // If time is up, handle session completion
          if (newRemainingTime <= 0) {
            handleSessionCompletion();
            return {
              ...prev,
              remainingTime: 0,
              isRunning: false,
              lastTickTimestamp: null,
              status: 'idle'
            };
          }
          
          return {
            ...prev,
            remainingTime: newRemainingTime,
            lastTickTimestamp: now
          };
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoroState.isRunning, pomodoroState.remainingTime]);

  const startTimer = async () => {
    if (!token) return;

    try {
      const session = await startPomodoroSession(token, pomodoroState.mode, pomodoroState.totalDuration, null);
      setPomodoroState(prev => ({
        ...prev,
        isRunning: true,
        remainingTime: prev.remainingTime > 0 ? prev.remainingTime : prev.totalDuration,
        lastTickTimestamp: Date.now(),
        sessionId: session.id,
        status: 'running'
      }));
    } catch (error) {
      console.error('Error starting pomodoro session:', error);
    }
  };

  const pauseTimer = async () => {
    if (!token || !pomodoroState.sessionId) return;

    try {
      const session = await pausePomodoroSession(token);
      setPomodoroState(prev => ({
        ...prev,
        isRunning: false,
        lastTickTimestamp: null,
        status: 'paused'
      }));
    } catch (error) {
      console.error('Error pausing pomodoro session:', error);
    }
  };

  const resumeTimer = async () => {
    if (!token || !pomodoroState.sessionId) return;

    try {
      const session = await resumePomodoroSession(token);
      setPomodoroState(prev => ({
        ...prev,
        isRunning: true,
        lastTickTimestamp: Date.now(),
        status: 'running'
      }));
    } catch (error) {
      console.error('Error resuming pomodoro session:', error);
    }
  };

  const resetTimer = async () => {
    if (!token || !pomodoroState.sessionId) return;

    try {
      await completePomodoroSession(token);
    } catch (error) {
      console.error('Error completing pomodoro session:', error);
    }

    // Reset local state
    setPomodoroState(prev => ({
      isRunning: false,
      mode: 'focus',
      remainingTime: 25 * 60,
      totalDuration: 25 * 60,
      lastTickTimestamp: null,
      sessionId: null,
      status: 'idle'
    }));
  };

  const switchMode = async (newMode) => {
    if (!token) return;

    // Complete current session
    if (pomodoroState.sessionId) {
      try {
        await completePomodoroSession(token);
      } catch (error) {
        console.error('Error completing session during mode switch:', error);
      }
    }

    // Set new mode and reset timer
    const newDuration = newMode === 'focus' ? 25 * 60 : 5 * 60;
    setPomodoroState(prev => ({
      ...prev,
      mode: newMode,
      remainingTime: newDuration,
      totalDuration: newDuration,
      lastTickTimestamp: null,
      sessionId: null,
      status: 'idle'
    }));
  };

  const handleSessionCompletion = async () => {
    if (!token) return;

    try {
      await completePomodoroSession(token);
    } catch (error) {
      console.error('Error completing pomodoro session:', error);
    }

    // Switch to next mode
    const nextMode = pomodoroState.mode === 'focus' ? 'break' : 'focus';
    const nextDuration = nextMode === 'focus' ? 25 * 60 : 5 * 60;

    setPomodoroState(prev => ({
      ...prev,
      mode: nextMode,
      remainingTime: nextDuration,
      totalDuration: nextDuration,
      lastTickTimestamp: null,
      sessionId: null,
      status: 'idle'
    }));
  };

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const progress = ((pomodoroState.totalDuration - pomodoroState.remainingTime) / pomodoroState.totalDuration) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const value = {
    pomodoroState,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    switchMode,
    formatTime,
    calculateProgress
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}