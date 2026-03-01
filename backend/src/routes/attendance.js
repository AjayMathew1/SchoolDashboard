const express = require('express');
const router = express.Router();
const { query, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all attendance records
router.get('/', async (req, res) => {
    try {
        const { month, year } = req.query;

        let sqlQuery = 'SELECT * FROM attendance WHERE 1=1';
        const params = [];

        if (month && year) {
            params.push(`${year}-${month.padStart(2, '0')}`);
            sqlQuery += ` AND TO_CHAR(date::DATE, 'YYYY-MM') = $${params.length}`;
        }

        sqlQuery += ' ORDER BY date DESC';

        const attendanceRes = await query(sqlQuery, params);
        const attendance = attendanceRes.rows;

        res.json(attendance);
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get attendance summary
router.get('/summary', async (req, res) => {
    try {
        const statsRes = await query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN status = 'Half_Day' THEN 0.5 ELSE 0 END) as half_days
      FROM attendance
      WHERE status IN ('Present', 'Absent', 'Late', 'Half_Day')
    `);
        const stats = statsRes.rows[0];

        const totalSchoolDays = parseInt(stats.total_days) || 0;
        const presentDays = parseFloat(stats.present_days || 0) + parseFloat(stats.half_days || 0);
        const attendancePercentage = totalSchoolDays > 0
            ? (presentDays / totalSchoolDays) * 100
            : 0;

        res.json({
            ...stats,
            attendancePercentage: Math.round(attendancePercentage * 10) / 10
        });
    } catch (error) {
        console.error('Get attendance summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single attendance record
router.get('/:id', async (req, res) => {
    try {
        const attendanceRes = await query('SELECT * FROM attendance WHERE attendance_id = $1', [req.params.id]);
        const attendance = attendanceRes.rows[0];

        if (!attendance) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        res.json(attendance);
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create attendance record
router.post('/', async (req, res) => {
    try {
        const {
            date, status, absenceCategory, reason,
            lateDurationMinutes, halfDayType, personalNotes
        } = req.body;

        if (!date || !status) {
            return res.status(400).json({ error: 'Date and status are required' });
        }

        const attendanceId = generateUUID();

        await query(`
      INSERT INTO attendance (
        attendance_id, date, status, absence_category, reason,
        late_duration_minutes, half_day_type, personal_notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
            attendanceId, date, status, absenceCategory, reason,
            lateDurationMinutes, halfDayType, personalNotes, req.user.userId
        ]);

        const attendanceRes = await query('SELECT * FROM attendance WHERE attendance_id = $1', [attendanceId]);
        const attendance = attendanceRes.rows[0];

        res.status(201).json(attendance);
    } catch (error) {
        console.error('Create attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update attendance record
router.put('/:id', async (req, res) => {
    try {
        const {
            status, absenceCategory, reason,
            lateDurationMinutes, personalNotes
        } = req.body;

        const result = await query(`
      UPDATE attendance SET
        status = COALESCE($1, status),
        absence_category = COALESCE($2, absence_category),
        reason = COALESCE($3, reason),
        late_duration_minutes = COALESCE($4, late_duration_minutes),
        personal_notes = COALESCE($5, personal_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE attendance_id = $6
    `, [status, absenceCategory, reason, lateDurationMinutes, personalNotes, req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        const attendanceRes = await query('SELECT * FROM attendance WHERE attendance_id = $1', [req.params.id]);
        const attendance = attendanceRes.rows[0];

        res.json(attendance);
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM attendance WHERE attendance_id = $1', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        console.error('Delete attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
