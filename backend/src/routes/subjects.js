const express = require('express');
const router = express.Router();
const { query, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all subjects
router.get('/', async (req, res) => {
    try {
        const subjectsRes = await query(`
      SELECT 
        s.*,
        (SELECT COUNT(*) FROM topics WHERE subject_id = s.subject_id) as total_topics,
        (SELECT COUNT(*) FROM topics WHERE subject_id = s.subject_id AND completion_status = 'Completed') as completed_topics
      FROM subjects s
      WHERE s.is_active = true
      ORDER BY s.subject_name
    `);
        const subjects = subjectsRes.rows;

        res.json(subjects);
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single subject
router.get('/:id', async (req, res) => {
    try {
        const subjectRes = await query('SELECT * FROM subjects WHERE subject_id = $1', [req.params.id]);
        const subject = subjectRes.rows[0];

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        // Get books
        const booksRes = await query('SELECT * FROM books WHERE subject_id = $1', [req.params.id]);
        const books = booksRes.rows;

        // Get topics
        const topicsRes = await query('SELECT * FROM topics WHERE subject_id = $1 ORDER BY chapter_number, topic_order', [req.params.id]);
        const topics = topicsRes.rows;

        res.json({
            ...subject,
            books,
            topics
        });
    } catch (error) {
        console.error('Get subject error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create subject
router.post('/', async (req, res) => {
    try {
        const {
            subjectName, subjectCode, subjectType, examBoard,
            targetGrade, predictedGrade, colorCode, description
        } = req.body;

        if (!subjectName || !subjectType) {
            return res.status(400).json({ error: 'Subject name and type are required' });
        }

        const subjectId = generateUUID();

        await query(`
      INSERT INTO subjects (
        subject_id, subject_name, subject_code, subject_type, exam_board,
        target_grade, predicted_grade, color_code, description, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
            subjectId, subjectName, subjectCode, subjectType, examBoard,
            targetGrade, predictedGrade, colorCode, description, req.user.userId
        ]);

        const subjectRes = await query('SELECT * FROM subjects WHERE subject_id = $1', [subjectId]);
        const subject = subjectRes.rows[0];

        res.status(201).json(subject);
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update subject
router.put('/:id', async (req, res) => {
    try {
        const {
            subjectName, subjectCode, subjectType, examBoard,
            targetGrade, predictedGrade, colorCode, description
        } = req.body;

        const result = await query(`
      UPDATE subjects SET
        subject_name = $1, subject_code = $2, subject_type = $3, exam_board = $4,
        target_grade = $5, predicted_grade = $6, color_code = $7, description = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE subject_id = $9
    `, [
            subjectName, subjectCode, subjectType, examBoard,
            targetGrade, predictedGrade, colorCode, description, req.params.id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const subjectRes = await query('SELECT * FROM subjects WHERE subject_id = $1', [req.params.id]);
        const subject = subjectRes.rows[0];

        res.json(subject);
    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete subject
router.delete('/:id', async (req, res) => {
    try {
        // Only admins can delete
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete subjects' });
        }

        const result = await query('UPDATE subjects SET is_active = false WHERE subject_id = $1', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Topics endpoints
router.post('/:subjectId/topics', async (req, res) => {
    try {
        const { topicName, chapterNumber, chapterName, difficultyLevel, weightagePercentage } = req.body;

        if (!topicName) {
            return res.status(400).json({ error: 'Topic name is required' });
        }

        const topicId = generateUUID();

        await query(`
      INSERT INTO topics (
        topic_id, subject_id, topic_name, chapter_number, chapter_name,
        difficulty_level, weightage_percentage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [topicId, req.params.subjectId, topicName, chapterNumber, chapterName, difficultyLevel, weightagePercentage]);

        const topicRes = await query('SELECT * FROM topics WHERE topic_id = $1', [topicId]);
        const topic = topicRes.rows[0];

        res.status(201).json(topic);
    } catch (error) {
        console.error('Create topic error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/topics/:topicId', async (req, res) => {
    try {
        const { topicName, completionStatus, dateCovered, personalNotes } = req.body;

        const result = await query(`
      UPDATE topics SET
        topic_name = COALESCE($1, topic_name),
        completion_status = COALESCE($2, completion_status),
        date_covered = COALESCE($3, date_covered),
        personal_notes = COALESCE($4, personal_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE topic_id = $5
    `, [topicName, completionStatus, dateCovered, personalNotes, req.params.topicId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const topicRes = await query('SELECT * FROM topics WHERE topic_id = $1', [req.params.topicId]);
        const topic = topicRes.rows[0];

        res.json(topic);
    } catch (error) {
        console.error('Update topic error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
