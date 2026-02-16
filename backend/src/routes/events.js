const express = require('express');
const router = express.Router();
const { db, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all events
router.get('/', (req, res) => {
    try {
        const events = db.prepare('SELECT * FROM events ORDER BY start_date DESC').all();
        res.json(events);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single event
router.get('/:id', (req, res) => {
    try {
        const event = db.prepare('SELECT * FROM events WHERE event_id = ?').get(req.params.id);

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
router.post('/', (req, res) => {
    try {
        const {
            eventName, eventType, startDate, endDate, location, organizer,
            description, participationLevel, roleDescription, includeInPortfolio
        } = req.body;

        if (!eventName || !eventType || !startDate) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const eventId = generateUUID();

        const stmt = db.prepare(`
      INSERT INTO events (
        event_id, event_name, event_type, start_date, end_date, location,
        organizer, description, participation_level, role_description,
        include_in_portfolio, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            eventId, eventName, eventType, startDate, endDate, location,
            organizer, description, participationLevel, roleDescription,
            includeInPortfolio ? 1 : 0, req.user.userId
        );

        const event = db.prepare('SELECT * FROM events WHERE event_id = ?').get(eventId);

        res.status(201).json(event);
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update event
router.put('/:id', (req, res) => {
    try {
        const {
            eventName, startDate, participationLevel, roleDescription, reflection
        } = req.body;

        const stmt = db.prepare(`
      UPDATE events SET
        event_name = COALESCE(?, event_name),
        start_date = COALESCE(?, start_date),
        participation_level = COALESCE(?, participation_level),
        role_description = COALESCE(?, role_description),
        reflection = COALESCE(?, reflection),
        updated_at = CURRENT_TIMESTAMP
      WHERE event_id = ?
    `);

        const result = stmt.run(eventName, startDate, participationLevel, roleDescription, reflection, req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const event = db.prepare('SELECT * FROM events WHERE event_id = ?').get(req.params.id);

        res.json(event);
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete event
router.delete('/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM events WHERE event_id = ?').run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
