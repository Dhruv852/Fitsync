require('dotenv').config();
const express = require('express');
const cors = require('cors');
const goalRoutes = require('./routes/goalRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'goal-service', status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/goals', goalRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

app.listen(PORT, () => console.log(`[Goal Service] Running on port ${PORT}`));
module.exports = app;
