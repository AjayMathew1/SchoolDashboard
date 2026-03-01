const express = require('express');
const router = express.Router();
const { query, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all awards
router.get('/', async (req, res) => {
    try {
        const awardsRes = await query('SELECT * FROM awards ORDER BY date_received DESC');
        res.json(awardsRes.rows);
    } catch (error) {
        console.error('Get awards error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single award
router.get('/:id', async (req, res) => {
    try {
        const awardRes = await query('SELECT * FROM awards WHERE award_id = $1', [req.params.id]);
        const award = awardRes.rows[0];

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
router.post('/', async (req, res) => {
    try {
        const {
            title, awardCategory, awardLevel, issuingAuthority, dateReceived,
            description, includeInPortfolio
        } = req.body;

        if (!title || !awardCategory || !awardLevel || !issuingAuthority || !dateReceived) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const awardId = generateUUID();

        await query(`
      INSERT INTO awards (
        award_id, title, award_category, award_level, issuing_authority,
        date_received, description, include_in_portfolio, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
            awardId, title, awardCategory, awardLevel, issuingAuthority,
            dateReceived, description, includeInPortfolio ? true : false, req.user.userId
        ]);

        const awardRes = await query('SELECT * FROM awards WHERE award_id = $1', [awardId]);
        const award = awardRes.rows[0];

        res.status(201).json(award);
    } catch (error) {
        console.error('Create award error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update award
router.put('/:id', async (req, res) => {
    try {
        const {
            title, description, achievementDetails, appreciations
        } = req.body;

        const result = await query(`
      UPDATE awards SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        achievement_details = COALESCE($3, achievement_details),
        appreciations = COALESCE($4, appreciations),
        updated_at = CURRENT_TIMESTAMP
      WHERE award_id = $5
    `, [title, description, achievementDetails, appreciations, req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Award not found' });
        }

        const awardRes = await query('SELECT * FROM awards WHERE award_id = $1', [req.params.id]);
        const award = awardRes.rows[0];

        res.json(award);
    } catch (error) {
        console.error('Update award error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete award
router.delete('/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM awards WHERE award_id = $1', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Award not found' });
        }

        res.json({ message: 'Award deleted successfully' });
    } catch (error) {
        console.error('Delete award error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
