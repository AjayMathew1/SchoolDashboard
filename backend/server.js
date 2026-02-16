require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Import routes
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');
const subjectsRoutes = require('./src/routes/subjects');
const assignmentsRoutes = require('./src/routes/assignments');
const testsRoutes = require('./src/routes/tests');
const attendanceRoutes = require('./src/routes/attendance');
const feesRoutes = require('./src/routes/fees');
const eventsRoutes = require('./src/routes/events');
const awardsRoutes = require('./src/routes/awards');
const activitiesRoutes = require('./src/routes/activities');
const notesRoutes = require('./src/routes/notes');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/awards', awardsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/notes', notesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Academic Dashboard API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            dashboard: '/api/dashboard',
            subjects: '/api/subjects',
            assignments: '/api/assignments',
            tests: '/api/tests',
            attendance: '/api/attendance',
            fees: '/api/fees',
            events: '/api/events',
            awards: '/api/awards',
            activities: '/api/activities',
            notes: '/api/notes'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`Academic Dashboard API Server`);
    console.log(`========================================`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`========================================\n`);
});

module.exports = app;
