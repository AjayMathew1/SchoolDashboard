const express = require('express');
const router = express.Router();
const { db, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all activities
router.get('/', (req, res) => {
    try {
        const activities = db.prepare('SELECT * FROM activities ORDER BY start_date DESC').all();
        res.json(activities);
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single activity
router.get('/:id', (req, res) => {
    try {
        const activity = db.prepare('SELECT * FROM activities WHERE activity_id = ?').get(req.params.id);

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json(activity);
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create activity
router.post('/', (req, res) => {
    try {
        const {
            activityName, activityType, startDate, endDate, durationHours,
            organizer, description, includeInPortfolio
        } = req.body;

        if (!activityName || !activityType || !startDate) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const activityId = generateUUID();

        const stmt = db.prepare(`
      INSERT INTO activities (
        activity_id, activity_name, activity_type, start_date, end_date,
        duration_hours, organizer, description, include_in_portfolio, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            activityId, activityName, activityType, startDate, endDate,
            durationHours, organizer, description, includeInPortfolio ? 1 : 0, req.user.userId
        );

        const activity = db.prepare('SELECT * FROM activities WHERE activity_id = ?').get(activityId);

        res.status(201).json(activity);
    } catch (error) {
        console.error('Create activity error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update activity
router.put('/:id', (req, res) => {
    try {
        const {
            activityName, description, outcome, reflection
        } = req.body;

        const stmt = db.prepare(`
      UPDATE activities SET
        activity_name = COALESCE(?, activity_name),
        description = COALESCE(?, description),
        outcome = COALESCE(?, outcome),
        reflection = COALESCE(?, reflection),
        updated_at = CURRENT_TIMESTAMP
      WHERE activity_id = ?
    `);

        const result = stmt.run(activityName, description, outcome, reflection, req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        const activity = db.prepare('SELECT * FROM activities WHERE activity_id = ?').get(req.params.id);

        res.json(activity);
    } catch (error) {
        console.error('Update activity error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete activity
router.delete('/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM activities WHERE activity_id = ?').run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        console.error('Delete activity error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
