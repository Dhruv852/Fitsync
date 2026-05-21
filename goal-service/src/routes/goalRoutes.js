const express = require('express');
const goalController = require('../controllers/goalController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

// Specific routes BEFORE parameterized /:id routes
router.get('/progress/weekly', goalController.getWeeklyProgress);

router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;
