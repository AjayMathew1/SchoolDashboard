const express = require('express');
const router = express.Router();
const { query, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Helper function to calculate grade from percentage
function calculateGrade(percentage) {
    if (percentage >= 90) return 'A*';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    if (percentage >= 30) return 'F';
    if (percentage >= 20) return 'G';
    return 'U';
}

// Get all tests
router.get('/', async (req, res) => {
    try {
        const { subjectId } = req.query;

        let sqlQuery = `
      SELECT t.*, s.subject_name, s.color_code
      FROM tests t
      LEFT JOIN subjects s ON t.subject_id = s.subject_id
      WHERE 1=1
    `;
        const params = [];

        if (subjectId) {
            params.push(subjectId);
            sqlQuery += ` AND t.subject_id = $${params.length}`;
        }

        sqlQuery += ' ORDER BY t.test_date DESC';

        const testsRes = await query(sqlQuery, params);
        const tests = testsRes.rows;

        res.json(tests);
    } catch (error) {
        console.error('Get tests error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get test analytics
router.get('/analytics', async (req, res) => {
    try {
        const { subjectId } = req.query;

        let sqlQuery = 'SELECT * FROM tests WHERE marks_obtained IS NOT NULL';
        const params = [];

        if (subjectId) {
            params.push(subjectId);
            sqlQuery += ` AND subject_id = $${params.length}`;
        }

        sqlQuery += ' ORDER BY test_date DESC LIMIT 10';

        const recentTestsRes = await query(sqlQuery, params);
        const recentTests = recentTestsRes.rows;

        // Calculate statistics
        const avgScore = recentTests.length > 0
            ? recentTests.reduce((sum, t) => sum + (parseFloat(t.percentage) || 0), 0) / recentTests.length
            : 0;

        // Subject-wise performance
        const subjectPerformanceRes = await query(`
      SELECT 
        s.subject_name,
        s.color_code,
        AVG(t.percentage) as avg_percentage,
        COUNT(t.test_id) as test_count
      FROM tests t
      JOIN subjects s ON t.subject_id = s.subject_id
      WHERE t.marks_obtained IS NOT NULL
      GROUP BY s.subject_id, s.subject_name, s.color_code
    `);
        const subjectPerformance = subjectPerformanceRes.rows;

        res.json({
            recentTests,
            avgScore: Math.round(avgScore * 10) / 10,
            subjectPerformance
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single test
router.get('/:id', async (req, res) => {
    try {
        const testRes = await query(`
      SELECT t.*, s.subject_name
      FROM tests t
      LEFT JOIN subjects s ON t.subject_id = s.subject_id
      WHERE t.test_id = $1
    `, [req.params.id]);

        const test = testRes.rows[0];

        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        res.json(test);
    } catch (error) {
        console.error('Get test error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create test
router.post('/', async (req, res) => {
    try {
        const {
            subjectId, testName, testType, testDate, academicTerm,
            maxMarks, marksObtained, classAverage, classHighest, rank, totalStudents
        } = req.body;

        if (!subjectId || !testName || !testDate || !testType || !maxMarks) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const testId = generateUUID();

        // Calculate percentage and grade
        let percentage = null;
        let grade = null;

        if (marksObtained !== null && marksObtained !== undefined) {
            percentage = (marksObtained / maxMarks) * 100;
            grade = calculateGrade(percentage);
        }

        await query(`
      INSERT INTO tests (
        test_id, subject_id, test_name, test_type, test_date, academic_term,
        max_marks, marks_obtained, percentage, grade,
        class_average, class_highest, rank, total_students, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
            testId, subjectId, testName, testType, testDate, academicTerm,
            maxMarks, marksObtained, percentage, grade,
            classAverage, classHighest, rank, totalStudents, req.user.userId
        ]);

        const testRes = await query('SELECT * FROM tests WHERE test_id = $1', [testId]);
        const test = testRes.rows[0];

        res.status(201).json(test);
    } catch (error) {
        console.error('Create test error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update test
router.put('/:id', async (req, res) => {
    try {
        const {
            testName, testDate, marksObtained, whatWentWell,
            areasToImprove, actionItems, personalNotes
        } = req.body;

        const testRes = await query('SELECT * FROM tests WHERE test_id = $1', [req.params.id]);
        const test = testRes.rows[0];

        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        // Recalculate percentage and grade if marks changed
        let percentage = test.percentage;
        let grade = test.grade;

        if (marksObtained !== null && marksObtained !== undefined) {
            percentage = (marksObtained / test.max_marks) * 100;
            grade = calculateGrade(percentage);
        }

        await query(`
      UPDATE tests SET
        test_name = COALESCE($1, test_name),
        test_date = COALESCE($2, test_date),
        marks_obtained = COALESCE($3, marks_obtained),
        percentage = COALESCE($4, percentage),
        grade = COALESCE($5, grade),
        what_went_well = COALESCE($6, what_went_well),
        areas_to_improve = COALESCE($7, areas_to_improve),
        action_items = COALESCE($8, action_items),
        personal_notes = COALESCE($9, personal_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE test_id = $10
    `, [
            testName, testDate, marksObtained, percentage, grade,
            whatWentWell, areasToImprove, actionItems, personalNotes, req.params.id
        ]);

        const updatedTestRes = await query('SELECT * FROM tests WHERE test_id = $1', [req.params.id]);
        const updatedTest = updatedTestRes.rows[0];

        res.json(updatedTest);
    } catch (error) {
        console.error('Update test error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete test
router.delete('/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM tests WHERE test_id = $1', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Test not found' });
        }

        res.json({ message: 'Test deleted successfully' });
    } catch (error) {
        console.error('Delete test error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
