const express = require('express');
const router = express.Router();
const { query, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all events
router.get('/', async (req, res) => {
    try {
        const eventsRes = await query('SELECT * FROM events ORDER BY start_date DESC');
        res.json(eventsRes.rows);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    try {
        const eventRes = await query('SELECT * FROM events WHERE event_id = $1', [req.params.id]);
        const event = eventRes.rows[0];

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create event
router.post('/', async (req, res) => {
    try {
        const {
            eventName, eventType, startDate, endDate, location, organizer,
            description, participationLevel, roleDescription, includeInPortfolio
        } = req.body;

        if (!eventName || !eventType || !startDate) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const eventId = generateUUID();

        await query(`
      INSERT INTO events (
        event_id, event_name, event_type, start_date, end_date, location,
        organizer, description, participation_level, role_description,
        include_in_portfolio, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
            eventId, eventName, eventType, startDate, endDate, location,
            organizer, description, participationLevel, roleDescription,
            includeInPortfolio ? true : false, req.user.userId
        ]);

        const eventRes = await query('SELECT * FROM events WHERE event_id = $1', [eventId]);
        const event = eventRes.rows[0];

        res.status(201).json(event);
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update event
router.put('/:id', async (req, res) => {
    try {
        const {
            eventName, startDate, participationLevel, roleDescription, reflection
        } = req.body;

        const result = await query(`
      UPDATE events SET
        event_name = COALESCE($1, event_name),
        start_date = COALESCE($2, start_date),
        participation_level = COALESCE($3, participation_level),
        role_description = COALESCE($4, role_description),
        reflection = COALESCE($5, reflection),
        updated_at = CURRENT_TIMESTAMP
      WHERE event_id = $6
    `, [eventName, startDate, participationLevel, roleDescription, reflection, req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const eventRes = await query('SELECT * FROM events WHERE event_id = $1', [req.params.id]);
        const event = eventRes.rows[0];

        res.json(event);
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete event
router.delete('/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM events WHERE event_id = $1', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
