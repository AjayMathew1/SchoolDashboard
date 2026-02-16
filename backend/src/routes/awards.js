const express = require('express');
const router = express.Router();
const { db, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all awards
router.get('/', (req, res) => {
    try {
        const awards = db.prepare('SELECT * FROM awards ORDER BY date_received DESC').all();
        res.json(awards);
    } catch (error) {
        console.error('Get awards error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single award
router.get('/:id', (req, res) => {
    try {
        const award = db.prepare('SELECT * FROM awards WHERE award_id = ?').get(req.params.id);

        if (!award) {
            return res.status(404).json({ error: 'Award not found' });
        }

        res.json(award);
    } catch (error) {
        console.error('Get award error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create award
router.post('/', (req, res) => {
    try {
        const {
            title, awardCategory, awardLevel, issuingAuthority, dateReceived,
            description, includeInPortfolio
        } = req.body;

        if (!title || !awardCategory || !awardLevel || !issuingAuthority || !dateReceived) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const awardId = generateUUID();

        const stmt = db.prepare(`
      INSERT INTO awards (
        award_id, title, award_category, award_level, issuing_authority,
        date_received, description, include_in_portfolio, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            awardId, title, awardCategory, awardLevel, issuingAuthority,
            dateReceived, description, includeInPortfolio ? 1 : 0, req.user.userId
        );

        const award = db.prepare('SELECT * FROM awards WHERE award_id = ?').get(awardId);

        res.status(201).json(award);
    } catch (error) {
        console.error('Create award error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update award
router.put('/:id', (req, res) => {
    try {
        const {
            title, description, achievementDetails, appreciations
        } = req.body;

        const stmt = db.prepare(`
      UPDATE awards SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        achievement_details = COALESCE(?, achievement_details),
        appreciations = COALESCE(?, appreciations),
        updated_at = CURRENT_TIMESTAMP
      WHERE award_id = ?
    `);

        const result = stmt.run(title, description, achievementDetails, appreciations, req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Award not found' });
        }

        const award = db.prepare('SELECT * FROM awards WHERE award_id = ?').get(req.params.id);

        res.json(award);
    } catch (error) {
        console.error('Update award error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete award
router.delete('/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM awards WHERE award_id = ?').run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Award not found' });
        }

        res.json({ message: 'Award deleted successfully' });
    } catch (error) {
        console.error('Delete award error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
