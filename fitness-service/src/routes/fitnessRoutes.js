const express = require('express');
const fitnessController = require('../controllers/fitnessController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// All fitness routes require authentication
router.use(authenticateToken);

// Workouts
router.get('/workouts', fitnessController.getWorkouts);
router.post('/workouts', fitnessController.addWorkout);
router.delete('/workouts/:id', fitnessController.deleteWorkout);

// Water
router.get('/water', fitnessController.getWaterLogs);
router.get('/water/today', fitnessController.getTodayWater);
router.post('/water', fitnessController.logWater);

// Weight
router.get('/weights', fitnessController.getWeights);
router.post('/weights', fitnessController.logWeight);

// BMI (can use body or profile values)
router.post('/bmi', fitnessController.calculateBMI);

// Dashboard analytics
router.get('/summary', fitnessController.getDailySummary);
router.get('/stats/weekly', fitnessController.getWeeklyStats);
router.get('/stats/calories', fitnessController.getCalorieStats);

module.exports = router;
