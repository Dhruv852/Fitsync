/**
 * Fitness Service — workouts, water intake, weight tracking, BMI, daily summary
 */
const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson } = require('../utils/fileStore');

const WORKOUTS_FILE = 'workouts.json';
const WATER_FILE = 'water.json';
const WEIGHTS_FILE = 'weights.json';

// --- Workouts ---
async function getWorkouts(userId) {
  const workouts = await readJson(WORKOUTS_FILE, []);
  return workouts.filter((w) => w.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
}

async function addWorkout(userId, { type, duration, calories, notes, date }) {
  if (!type || !duration) {
    const err = new Error('Workout type and duration are required');
    err.status = 400;
    throw err;
  }
  const workout = {
    id: uuidv4(),
    userId,
    type,
    duration: Number(duration),
    calories: Number(calories) || Math.round(Number(duration) * 8),
    notes: notes || '',
    date: date || new Date().toISOString().split('T')[0],
  };
  const workouts = await readJson(WORKOUTS_FILE, []);
  workouts.push(workout);
  await writeJson(WORKOUTS_FILE, workouts);
  return workout;
}

async function deleteWorkout(userId, workoutId) {
  const workouts = await readJson(WORKOUTS_FILE, []);
  const index = workouts.findIndex((w) => w.id === workoutId && w.userId === userId);
  if (index === -1) {
    const err = new Error('Workout not found');
    err.status = 404;
    throw err;
  }
  workouts.splice(index, 1);
  await writeJson(WORKOUTS_FILE, workouts);
  return { deleted: true };
}

// --- Water intake ---
async function getWaterLogs(userId) {
  const logs = await readJson(WATER_FILE, []);
  return logs.filter((l) => l.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
}

async function logWater(userId, { glasses, date }) {
  const logDate = date || new Date().toISOString().split('T')[0];
  const logs = await readJson(WATER_FILE, []);
  const existing = logs.findIndex((l) => l.userId === userId && l.date === logDate);

  const entry = {
    id: existing >= 0 ? logs[existing].id : uuidv4(),
    userId,
    glasses: Number(glasses) || 1,
    date: logDate,
  };

  if (existing >= 0) {
    logs[existing].glasses = (logs[existing].glasses || 0) + entry.glasses;
  } else {
    logs.push(entry);
  }
  await writeJson(WATER_FILE, logs);
  return existing >= 0 ? logs[existing] : entry;
}

async function getTodayWater(userId) {
  const today = new Date().toISOString().split('T')[0];
  const logs = await readJson(WATER_FILE, []);
  const todayLog = logs.find((l) => l.userId === userId && l.date === today);
  return { glasses: todayLog?.glasses || 0, date: today };
}

// --- Weight tracking ---
async function getWeights(userId) {
  const weights = await readJson(WEIGHTS_FILE, []);
  return weights.filter((w) => w.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
}

async function logWeight(userId, { weight, date }) {
  if (!weight) {
    const err = new Error('Weight value is required');
    err.status = 400;
    throw err;
  }
  const entry = {
    id: uuidv4(),
    userId,
    weight: Number(weight),
    date: date || new Date().toISOString().split('T')[0],
  };
  const weights = await readJson(WEIGHTS_FILE, []);
  weights.push(entry);
  await writeJson(WEIGHTS_FILE, weights);
  return entry;
}

// --- BMI Calculator ---
function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) {
    const err = new Error('Weight (kg) and height (cm) are required');
    err.status = 400;
    throw err;
  }
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    weightKg: Number(weightKg),
    heightCm: Number(heightCm),
  };
}

// --- Daily summary & stats for dashboard ---
async function getDailySummary(userId) {
  const today = new Date().toISOString().split('T')[0];
  const workouts = await getWorkouts(userId);
  const todayWorkouts = workouts.filter((w) => w.date === today);
  const totalCalories = todayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const water = await getTodayWater(userId);
  const weights = await getWeights(userId);
  const latestWeight = weights[0]?.weight || null;

  return {
    date: today,
    workoutsCount: todayWorkouts.length,
    totalCalories,
    waterGlasses: water.glasses,
    latestWeight,
    totalWorkouts: workouts.length,
  };
}

async function getWeeklyStats(userId) {
  const workouts = await getWorkouts(userId);
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayWorkouts = workouts.filter((w) => w.date === dateStr);
    last7.push({
      date: dateStr,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      calories: dayWorkouts.reduce((s, w) => s + (w.calories || 0), 0),
      workouts: dayWorkouts.length,
    });
  }
  return last7;
}

async function getCalorieStats(userId) {
  const workouts = await getWorkouts(userId);
  const total = workouts.reduce((s, w) => s + (w.calories || 0), 0);
  const thisWeek = await getWeeklyStats(userId);
  const weekTotal = thisWeek.reduce((s, d) => s + d.calories, 0);
  return { total, weekTotal, averagePerWorkout: workouts.length ? Math.round(total / workouts.length) : 0 };
}

module.exports = {
  getWorkouts,
  addWorkout,
  deleteWorkout,
  getWaterLogs,
  logWater,
  getTodayWater,
  getWeights,
  logWeight,
  calculateBMI,
  getDailySummary,
  getWeeklyStats,
  getCalorieStats,
};
