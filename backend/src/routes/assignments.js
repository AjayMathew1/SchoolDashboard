const express = require('express');
const router = express.Router();
const { db, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all assignments
router.get('/', (req, res) => {
    try {
        const { status, subjectId, view } = req.query;

        let query = `
      SELECT a.*, s.subject_name, s.color_code
      FROM assignments a
      LEFT JOIN subjects s ON a.subject_id = s.subject_id
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }

        if (subjectId) {
            query += ' AND a.subject_id = ?';
            params.push(subjectId);
        }

        query += ' ORDER BY a.due_date ASC';

        const assignments = db.prepare(query).all(...params);

        res.json(assignments);
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single assignment
router.get('/:id', (req, res) => {
    try {
        const assignment = db.prepare(`
      SELECT a.*, s.subject_name
      FROM assignments a
      LEFT JOIN subjects s ON a.subject_id = s.subject_id
      WHERE a.assignment_id = ?
    `).get(req.params.id);

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json(assignment);
    } catch (error) {
        console.error('Get assignment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create assignment
router.post('/', (req, res) => {
    try {
        const {
            subjectId, title, description, assignmentType, assignedDate,
            dueDate, dueTime, priority, maxMarks, weightagePercentage
        } = req.body;

        if (!subjectId || !title || !dueDate || !assignmentType) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const assignmentId = generateUUID();

        const stmt = db.prepare(`
      INSERT INTO assignments (
        assignment_id, subject_id, title, description, assignment_type,
        assigned_date, due_date, due_time, priority, max_marks,
        weightage_percentage, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            assignmentId, subjectId, title, description, assignmentType,
            assignedDate, dueDate, dueTime, priority, maxMarks,
            weightagePercentage, req.user.userId
        );

        const assignment = db.prepare('SELECT * FROM assignments WHERE assignment_id = ?').get(assignmentId);

        res.status(201).json(assignment);
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update assignment
router.put('/:id', (req, res) => {
    try {
        const {
            title, description, dueDate, status, marksObtained,
            feedback, submissionDate, personalNotes
        } = req.body;

        const stmt = db.prepare(`
      UPDATE assignments SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        due_date = COALESCE(?, due_date),
        status = COALESCE(?, status),
        marks_obtained = COALESCE(?, marks_obtained),
        feedback = COALESCE(?, feedback),
        submission_date = COALESCE(?, submission_date),
        personal_notes = COALESCE(?, personal_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE assignment_id = ?
    `);

        const result = stmt.run(
            title, description, dueDate, status, marksObtained,
            feedback, submissionDate, personalNotes, req.params.id
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const assignment = db.prepare('SELECT * FROM assignments WHERE assignment_id = ?').get(req.params.id);

        res.json(assignment);
    } catch (error) {
        console.error('Update assignment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete assignment
router.delete('/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM assignments WHERE assignment_id = ?').run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
