const express = require('express');
const router = express.Router();
const { db, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all subjects
router.get('/', (req, res) => {
    try {
        const subjects = db.prepare(`
      SELECT 
        s.*,
        (SELECT COUNT(*) FROM topics WHERE subject_id = s.subject_id) as total_topics,
        (SELECT COUNT(*) FROM topics WHERE subject_id = s.subject_id AND completion_status = 'Completed') as completed_topics
      FROM subjects s
      WHERE s.is_active = 1
      ORDER BY s.subject_name
    `).all();

        res.json(subjects);
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single subject
router.get('/:id', (req, res) => {
    try {
        const subject = db.prepare('SELECT * FROM subjects WHERE subject_id = ?').get(req.params.id);

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        // Get books
        const books = db.prepare('SELECT * FROM books WHERE subject_id = ?').all(req.params.id);

        // Get topics
        const topics = db.prepare('SELECT * FROM topics WHERE subject_id = ? ORDER BY chapter_number, topic_order').all(req.params.id);

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
router.post('/', (req, res) => {
    try {
        const {
            subjectName, subjectCode, subjectType, examBoard,
            targetGrade, predictedGrade, colorCode, description
        } = req.body;

        if (!subjectName || !subjectType) {
            return res.status(400).json({ error: 'Subject name and type are required' });
        }

        const subjectId = generateUUID();

        const stmt = db.prepare(`
      INSERT INTO subjects (
        subject_id, subject_name, subject_code, subject_type, exam_board,
        target_grade, predicted_grade, color_code, description, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            subjectId, subjectName, subjectCode, subjectType, examBoard,
            targetGrade, predictedGrade, colorCode, description, req.user.userId
        );

        const subject = db.prepare('SELECT * FROM subjects WHERE subject_id = ?').get(subjectId);

        res.status(201).json(subject);
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update subject
router.put('/:id', (req, res) => {
    try {
        const {
            subjectName, subjectCode, subjectType, examBoard,
            targetGrade, predictedGrade, colorCode, description
        } = req.body;

        const stmt = db.prepare(`
      UPDATE subjects SET
        subject_name = ?, subject_code = ?, subject_type = ?, exam_board = ?,
        target_grade = ?, predicted_grade = ?, color_code = ?, description = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE subject_id = ?
    `);

        const result = stmt.run(
            subjectName, subjectCode, subjectType, examBoard,
            targetGrade, predictedGrade, colorCode, description, req.params.id
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const subject = db.prepare('SELECT * FROM subjects WHERE subject_id = ?').get(req.params.id);

        res.json(subject);
    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete subject
router.delete('/:id', (req, res) => {
    try {
        // Only admins can delete
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete subjects' });
        }

        const result = db.prepare('UPDATE subjects SET is_active = 0 WHERE subject_id = ?').run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Topics endpoints
router.post('/:subjectId/topics', (req, res) => {
    try {
        const { topicName, chapterNumber, chapterName, difficultyLevel, weightagePercentage } = req.body;

        if (!topicName) {
            return res.status(400).json({ error: 'Topic name is required' });
        }

        const topicId = generateUUID();

        const stmt = db.prepare(`
      INSERT INTO topics (
        topic_id, subject_id, topic_name, chapter_number, chapter_name,
        difficulty_level, weightage_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(topicId, req.params.subjectId, topicName, chapterNumber, chapterName, difficultyLevel, weightagePercentage);

        const topic = db.prepare('SELECT * FROM topics WHERE topic_id = ?').get(topicId);

        res.status(201).json(topic);
    } catch (error) {
        console.error('Create topic error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/topics/:topicId', (req, res) => {
    try {
        const { topicName, completionStatus, dateCovered, personalNotes } = req.body;

        const stmt = db.prepare(`
      UPDATE topics SET
        topic_name = COALESCE(?, topic_name),
        completion_status = COALESCE(?, completion_status),
        date_covered = COALESCE(?, date_covered),
        personal_notes = COALESCE(?, personal_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE topic_id = ?
    `);

        const result = stmt.run(topicName, completionStatus, dateCovered, personalNotes, req.params.topicId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const topic = db.prepare('SELECT * FROM topics WHERE topic_id = ?').get(req.params.topicId);

        res.json(topic);
    } catch (error) {
        console.error('Update topic error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
