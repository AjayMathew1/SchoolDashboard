const express = require('express');
const router = express.Router();
const { query, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all assignments
router.get('/', async (req, res) => {
    try {
        const { status, subjectId, view } = req.query;

        let sqlQuery = `
      SELECT a.*, s.subject_name, s.color_code
      FROM assignments a
      LEFT JOIN subjects s ON a.subject_id = s.subject_id
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            params.push(status);
            sqlQuery += ` AND a.status = $${params.length}`;
        }

        if (subjectId) {
            params.push(subjectId);
            sqlQuery += ` AND a.subject_id = $${params.length}`;
        }

        sqlQuery += ' ORDER BY a.due_date ASC';

        const assignmentsRes = await query(sqlQuery, params);
        const assignments = assignmentsRes.rows;

        res.json(assignments);
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single assignment
router.get('/:id', async (req, res) => {
    try {
        const assignmentRes = await query(`
      SELECT a.*, s.subject_name
      FROM assignments a
      LEFT JOIN subjects s ON a.subject_id = s.subject_id
      WHERE a.assignment_id = $1
    `, [req.params.id]);

        const assignment = assignmentRes.rows[0];

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
router.post('/', async (req, res) => {
    try {
        const {
            subjectId, title, description, assignmentType, assignedDate,
            dueDate, dueTime, priority, maxMarks, weightagePercentage
        } = req.body;

        if (!subjectId || !title || !dueDate || !assignmentType) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const assignmentId = generateUUID();

        await query(`
      INSERT INTO assignments (
        assignment_id, subject_id, title, description, assignment_type,
        assigned_date, due_date, due_time, priority, max_marks,
        weightage_percentage, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
            assignmentId, subjectId, title, description, assignmentType,
            assignedDate, dueDate, dueTime, priority, maxMarks,
            weightagePercentage, req.user.userId
        ]);

        const assignmentRes = await query('SELECT * FROM assignments WHERE assignment_id = $1', [assignmentId]);
        const assignment = assignmentRes.rows[0];

        res.status(201).json(assignment);
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update assignment
router.put('/:id', async (req, res) => {
    try {
        const {
            title, description, dueDate, status, marksObtained,
            feedback, submissionDate, personalNotes
        } = req.body;

        const result = await query(`
      UPDATE assignments SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        due_date = COALESCE($3, due_date),
        status = COALESCE($4, status),
        marks_obtained = COALESCE($5, marks_obtained),
        feedback = COALESCE($6, feedback),
        submission_date = COALESCE($7, submission_date),
        personal_notes = COALESCE($8, personal_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE assignment_id = $9
    `, [
            title, description, dueDate, status, marksObtained,
            feedback, submissionDate, personalNotes, req.params.id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const assignmentRes = await query('SELECT * FROM assignments WHERE assignment_id = $1', [req.params.id]);
        const assignment = assignmentRes.rows[0];

        res.json(assignment);
    } catch (error) {
        console.error('Update assignment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete assignment
router.delete('/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM assignments WHERE assignment_id = $1', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
