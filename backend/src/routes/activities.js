const express = require('express');
const router = express.Router();
const { query, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all activities
router.get('/', async (req, res) => {
    try {
        const activitiesRes = await query('SELECT * FROM activities ORDER BY start_date DESC');
        res.json(activitiesRes.rows);
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single activity
router.get('/:id', async (req, res) => {
    try {
        const activityRes = await query('SELECT * FROM activities WHERE activity_id = $1', [req.params.id]);
        const activity = activityRes.rows[0];

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
router.post('/', async (req, res) => {
    try {
        const {
            activityName, activityType, startDate, endDate, durationHours,
            organizer, description, includeInPortfolio
        } = req.body;

        if (!activityName || !activityType || !startDate) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const activityId = generateUUID();

        await query(`
      INSERT INTO activities (
        activity_id, activity_name, activity_type, start_date, end_date,
        duration_hours, organizer, description, include_in_portfolio, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
            activityId, activityName, activityType, startDate, endDate,
            durationHours, organizer, description, includeInPortfolio ? true : false, req.user.userId
        ]);

        const activityRes = await query('SELECT * FROM activities WHERE activity_id = $1', [activityId]);
        const activity = activityRes.rows[0];

        res.status(201).json(activity);
    } catch (error) {
        console.error('Create activity error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update activity
router.put('/:id', async (req, res) => {
    try {
        const {
            activityName, description, outcome, reflection
        } = req.body;

        const result = await query(`
      UPDATE activities SET
        activity_name = COALESCE($1, activity_name),
        description = COALESCE($2, description),
        outcome = COALESCE($3, outcome),
        reflection = COALESCE($4, reflection),
        updated_at = CURRENT_TIMESTAMP
      WHERE activity_id = $5
    `, [activityName, description, outcome, reflection, req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        const activityRes = await query('SELECT * FROM activities WHERE activity_id = $1', [req.params.id]);
        const activity = activityRes.rows[0];

        res.json(activity);
    } catch (error) {
        console.error('Update activity error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete activity
router.delete('/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM activities WHERE activity_id = $1', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        console.error('Delete activity error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
