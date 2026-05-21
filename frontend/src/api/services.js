/**
 * API Service Layer — centralizes all microservice HTTP calls
 */
import api from './axios';

// --- Auth Service ---
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  updateStreak: () => api.post('/api/auth/streak'),
};

// --- Fitness Service ---
export const fitnessAPI = {
  getWorkouts: () => api.get('/api/fitness/workouts'),
  addWorkout: (data) => api.post('/api/fitness/workouts', data),
  deleteWorkout: (id) => api.delete(`/api/fitness/workouts/${id}`),
  getWaterLogs: () => api.get('/api/fitness/water'),
  getTodayWater: () => api.get('/api/fitness/water/today'),
  logWater: (data) => api.post('/api/fitness/water', data),
  getWeights: () => api.get('/api/fitness/weights'),
  logWeight: (data) => api.post('/api/fitness/weights', data),
  calculateBMI: (data) => api.post('/api/fitness/bmi', data),
  getDailySummary: () => api.get('/api/fitness/summary'),
  getWeeklyStats: () => api.get('/api/fitness/stats/weekly'),
  getCalorieStats: () => api.get('/api/fitness/stats/calories'),
};

// --- Goal Service ---
export const goalAPI = {
  getGoals: () => api.get('/api/goals'),
  createGoal: (data) => api.post('/api/goals', data),
  updateGoal: (id, data) => api.put(`/api/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/api/goals/${id}`),
  getWeeklyProgress: () => api.get('/api/goals/progress/weekly'),
};
