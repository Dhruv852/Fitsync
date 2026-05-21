require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fitnessRoutes = require('./routes/fitnessRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'fitness-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/fitness', fitnessRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Fitness Service] Running on port ${PORT}`);
});

module.exports = app;
