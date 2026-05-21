const goalService = require('../services/goalService');

async function getGoals(req, res, next) {
  try {
    res.json({ success: true, data: await goalService.getGoals(req.user.userId) });
  } catch (err) {
    next(err);
  }
}

async function createGoal(req, res, next) {
  try {
    const data = await goalService.createGoal(req.user.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateGoal(req, res, next) {
  try {
    const data = await goalService.updateGoal(req.user.userId, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function deleteGoal(req, res, next) {
  try {
    const data = await goalService.deleteGoal(req.user.userId, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getWeeklyProgress(req, res, next) {
  try {
    const data = await goalService.getWeeklyProgress(req.user.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGoals, createGoal, updateGoal, deleteGoal, getWeeklyProgress };
