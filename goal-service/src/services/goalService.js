/**
 * Goal Service — fitness goals, weight targets, progress tracking
 */
const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson } = require('../utils/fileStore');

const GOALS_FILE = 'goals.json';

function calcProgress(current, target, type) {
  if (!target || target === 0) return 0;
  // For weight loss goals, progress increases as current approaches target
  if (type === 'weight') {
    const start = current > target ? current : target;
    const progress = Math.min(100, Math.max(0, ((start - current) / (start - target)) * 100));
    return Math.round(isNaN(progress) ? (current <= target ? 100 : 0) : progress);
  }
  return Math.min(100, Math.round((current / target) * 100));
}

async function getGoals(userId) {
  const goals = await readJson(GOALS_FILE, []);
  return goals
    .filter((g) => g.userId === userId)
    .map((g) => ({
      ...g,
      progressPercent: calcProgress(g.current, g.target, g.type),
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function createGoal(userId, body) {
  const { title, type, target, current, unit, deadline } = body;
  if (!title || !type || target === undefined) {
    const err = new Error('Title, type, and target are required');
    err.status = 400;
    throw err;
  }
  const goal = {
    id: uuidv4(),
    userId,
    title,
    type,
    target: Number(target),
    current: Number(current) || 0,
    unit: unit || '',
    deadline: deadline || null,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  goal.progressPercent = calcProgress(goal.current, goal.target, goal.type);

  const goals = await readJson(GOALS_FILE, []);
  goals.push(goal);
  await writeJson(GOALS_FILE, goals);
  return goal;
}

async function updateGoal(userId, goalId, updates) {
  const goals = await readJson(GOALS_FILE, []);
  const index = goals.findIndex((g) => g.id === goalId && g.userId === userId);
  if (index === -1) {
    const err = new Error('Goal not found');
    err.status = 404;
    throw err;
  }

  const allowed = ['title', 'target', 'current', 'unit', 'deadline', 'status'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) {
      goals[index][key] =
        ['target', 'current'].includes(key) ? Number(updates[key]) : updates[key];
    }
  });
  goals[index].updatedAt = new Date().toISOString();
  goals[index].progressPercent = calcProgress(
    goals[index].current,
    goals[index].target,
    goals[index].type
  );

  if (goals[index].progressPercent >= 100) {
    goals[index].status = 'completed';
  }

  await writeJson(GOALS_FILE, goals);
  return goals[index];
}

async function deleteGoal(userId, goalId) {
  const goals = await readJson(GOALS_FILE, []);
  const filtered = goals.filter((g) => !(g.id === goalId && g.userId === userId));
  if (filtered.length === goals.length) {
    const err = new Error('Goal not found');
    err.status = 404;
    throw err;
  }
  await writeJson(GOALS_FILE, filtered);
  return { deleted: true };
}

async function getWeeklyProgress(userId) {
  const goals = await getGoals(userId);
  const active = goals.filter((g) => g.status === 'active');
  const completed = goals.filter((g) => g.status === 'completed');
  const avgProgress =
    active.length > 0
      ? Math.round(active.reduce((s, g) => s + g.progressPercent, 0) / active.length)
      : 0;

  return {
    totalGoals: goals.length,
    activeGoals: active.length,
    completedGoals: completed.length,
    averageProgress: avgProgress,
    goals: active.slice(0, 5),
  };
}

module.exports = { getGoals, createGoal, updateGoal, deleteGoal, getWeeklyProgress, calcProgress };
