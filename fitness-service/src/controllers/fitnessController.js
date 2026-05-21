const fitnessService = require('../services/fitnessService');

async function getWorkouts(req, res, next) {
  try {
    const data = await fitnessService.getWorkouts(req.user.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function addWorkout(req, res, next) {
  try {
    const data = await fitnessService.addWorkout(req.user.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function deleteWorkout(req, res, next) {
  try {
    const data = await fitnessService.deleteWorkout(req.user.userId, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getWaterLogs(req, res, next) {
  try {
    const data = await fitnessService.getWaterLogs(req.user.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function logWater(req, res, next) {
  try {
    const data = await fitnessService.logWater(req.user.userId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getTodayWater(req, res, next) {
  try {
    const data = await fitnessService.getTodayWater(req.user.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getWeights(req, res, next) {
  try {
    const data = await fitnessService.getWeights(req.user.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function logWeight(req, res, next) {
  try {
    const data = await fitnessService.logWeight(req.user.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function calculateBMI(req, res, next) {
  try {
    const { weight, height } = req.body;
    const data = fitnessService.calculateBMI(weight, height);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getDailySummary(req, res, next) {
  try {
    const data = await fitnessService.getDailySummary(req.user.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getWeeklyStats(req, res, next) {
  try {
    const data = await fitnessService.getWeeklyStats(req.user.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getCalorieStats(req, res, next) {
  try {
    const data = await fitnessService.getCalorieStats(req.user.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
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
