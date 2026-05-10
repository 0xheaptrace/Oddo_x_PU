require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tripsRoutes = require('./routes/trips.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const destinationsRoutes = require('./routes/destinations.routes');
const browseActivitiesRoutes = require('./routes/browseActivities.routes');
const publicRoutes = require('./routes/public.routes');
const shareRoutes = require('./routes/share.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');
const guidesRoutes = require('./routes/guides.routes');

const app = express();
const PORT = process.env.PORT || 4000;

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'traveloop-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/browse-activities', browseActivitiesRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/guides', guidesRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Traveloop API listening on port ${PORT}`);
});
