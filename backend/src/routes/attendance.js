const express = require('express');
const router = express.Router();
const { db, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all attendance records
router.get('/', (req, res) => {
    try {
        const { month, year } = req.query;

        let query = 'SELECT * FROM attendance WHERE 1=1';
        const params = [];

        if (month && year) {
            query += ` AND strftime('%Y-%m', date) = ?`;
            params.push(`${year}-${month.padStart(2, '0')}`);
        }

        query += ' ORDER BY date DESC';

        const attendance = db.prepare(query).all(...params);

        res.json(attendance);
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get attendance summary
router.get('/summary', (req, res) => {
    try {
        const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN status = 'Half_Day' THEN 0.5 ELSE 0 END) as half_days
      FROM attendance
      WHERE status IN ('Present', 'Absent', 'Late', 'Half_Day')
    `).get();

        const totalSchoolDays = stats.total_days || 0;
        const presentDays = (stats.present_days || 0) + (stats.half_days || 0);
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
router.get('/:id', (req, res) => {
    try {
        const attendance = db.prepare('SELECT * FROM attendance WHERE attendance_id = ?').get(req.params.id);

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
router.post('/', (req, res) => {
    try {
        const {
            date, status, absenceCategory, reason,
            lateDurationMinutes, halfDayType, personalNotes
        } = req.body;

        if (!date || !status) {
            return res.status(400).json({ error: 'Date and status are required' });
        }

        const attendanceId = generateUUID();

        const stmt = db.prepare(`
      INSERT INTO attendance (
        attendance_id, date, status, absence_category, reason,
        late_duration_minutes, half_day_type, personal_notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            attendanceId, date, status, absenceCategory, reason,
            lateDurationMinutes, halfDayType, personalNotes, req.user.userId
        );

        const attendance = db.prepare('SELECT * FROM attendance WHERE attendance_id = ?').get(attendanceId);

        res.status(201).json(attendance);
    } catch (error) {
        console.error('Create attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update attendance record
router.put('/:id', (req, res) => {
    try {
        const {
            status, absenceCategory, reason,
            lateDurationMinutes, personalNotes
        } = req.body;

        const stmt = db.prepare(`
      UPDATE attendance SET
        status = COALESCE(?, status),
        absence_category = COALESCE(?, absence_category),
        reason = COALESCE(?, reason),
        late_duration_minutes = COALESCE(?, late_duration_minutes),
        personal_notes = COALESCE(?, personal_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE attendance_id = ?
    `);

        const result = stmt.run(status, absenceCategory, reason, lateDurationMinutes, personalNotes, req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        const attendance = db.prepare('SELECT * FROM attendance WHERE attendance_id = ?').get(req.params.id);

        res.json(attendance);
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete attendance record
router.delete('/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM attendance WHERE attendance_id = ?').run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        console.error('Delete attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
