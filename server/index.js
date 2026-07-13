require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const limiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const libraryRoutes = require('./routes/libraryRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const statsRoutes = require('./routes/statsRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(limiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.use('/api/library', libraryRoutes);
app.use('/api/recommendations', recommendRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/history', historyRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`SteamRec server running on http://localhost:${PORT}`);
  });
};

start();
