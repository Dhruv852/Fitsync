/**
 * Auth Controller — handles HTTP request/response for auth routes
 */
const userService = require('../services/userService');

async function register(req, res, next) {
  try {
    const result = await userService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await userService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const profile = await userService.getProfile(req.user.userId);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await userService.updateProfile(req.user.userId, req.body);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

async function updateStreak(req, res, next) {
  try {
    const streak = await userService.updateStreak(req.user.userId);
    res.json({ success: true, data: { streak } });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getProfile, updateProfile, updateStreak };
