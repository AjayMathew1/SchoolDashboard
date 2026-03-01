const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Attendance percentage
    const attendanceStatsRes = await query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'Half_Day' THEN 0.5 ELSE 0 END) as half_days
      FROM attendance
      WHERE status IN ('Present', 'Absent', 'Late', 'Half_Day')
    `);
    const attendanceStats = attendanceStatsRes.rows[0];

    const totalSchoolDays = parseInt(attendanceStats.total_days) || 0;
    const presentDays = parseFloat(attendanceStats.present_days || 0) + parseFloat(attendanceStats.half_days || 0);
    const attendancePercentage = totalSchoolDays > 0
      ? ((presentDays / totalSchoolDays) * 100).toFixed(1)
      : 0;

    // Average grade (from recent tests)
    const avgGradeDataRes = await query(`
      SELECT AVG(percentage) as avg_percentage
      FROM tests
      WHERE marks_obtained IS NOT NULL
    `);
    const avgGradeData = avgGradeDataRes.rows[0];

    const avgPercentage = parseFloat(avgGradeData.avg_percentage) || 0;

    // Pending assignments
    const pendingAssignmentsRes = await query(`
      SELECT COUNT(*) as count
      FROM assignments
      WHERE status NOT IN ('Submitted', 'Graded')
    `);
    const pendingAssignments = parseInt(pendingAssignmentsRes.rows[0].count) || 0;

    // Upcoming tests (next 14 days)
    const upcomingTestsRes = await query(`
      SELECT COUNT(*) as count
      FROM tests
      WHERE test_date > CURRENT_DATE AND test_date <= (CURRENT_DATE + INTERVAL '14 days')
    `);
    const upcomingTests = parseInt(upcomingTestsRes.rows[0].count) || 0;

    res.json({
      attendancePercentage: parseFloat(attendancePercentage),
      avgPercentage: Math.round(avgPercentage * 10) / 10,
      pendingAssignments,
      upcomingTests
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upcoming deadlines (7 days)
router.get('/deadlines', async (req, res) => {
  try {
    const deadlines = [];

    // Assignments
    const assignmentsRes = await query(`
      SELECT a.assignment_id as id, a.title, a.due_date as date, 'assignment' as type, s.subject_name, s.color_code
      FROM assignments a
      LEFT JOIN subjects s ON a.subject_id = s.subject_id
      WHERE a.due_date >= CURRENT_DATE AND a.due_date <= (CURRENT_DATE + INTERVAL '7 days')
      AND a.status NOT IN ('Submitted', 'Graded')
    `);
    const assignments = assignmentsRes.rows;

    // Tests
    const testsRes = await query(`
      SELECT t.test_id as id, t.test_name as title, t.test_date as date, 'test' as type, s.subject_name, s.color_code
      FROM tests t
      LEFT JOIN subjects s ON t.subject_id = s.subject_id
      WHERE t.test_date >= CURRENT_DATE AND t.test_date <= (CURRENT_DATE + INTERVAL '7 days')
    `);
    const tests = testsRes.rows;

    // Fees
    const feesRes = await query(`
      SELECT fee_id as id, description as title, due_date as date, 'fee' as type, NULL as subject_name, NULL as color_code
      FROM fees
      WHERE due_date >= CURRENT_DATE AND due_date <= (CURRENT_DATE + INTERVAL '7 days')
      AND payment_status = 'Pending'
    `);
    const fees = feesRes.rows;

    deadlines.push(...assignments, ...tests, ...fees);
    deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(deadlines.slice(0, 5));  // Return top 5
  } catch (error) {
    console.error('Get deadlines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = [];

    // Overdue assignments
    const overdueAssignmentsRes = await query(`
      SELECT COUNT(*) as count
      FROM assignments
      WHERE due_date < CURRENT_DATE AND status NOT IN ('Submitted', 'Graded')
    `);
    const overdueAssignments = parseInt(overdueAssignmentsRes.rows[0].count) || 0;

    if (overdueAssignments > 0) {
      alerts.push({
        type: 'warning',
        message: `${overdueAssignments} overdue assignment${overdueAssignments > 1 ? 's' : ''}`,
        priority: 'high'
      });
    }

    // Tests tomorrow
    const testsTomorrowRes = await query(`
      SELECT t.test_name, s.subject_name
      FROM tests t
      LEFT JOIN subjects s ON t.subject_id = s.subject_id
      WHERE t.test_date = (CURRENT_DATE + INTERVAL '1 day')
    `);
    const testsTomorrow = testsTomorrowRes.rows;

    testsTomorrow.forEach(test => {
      alerts.push({
        type: 'info',
        message: `${test.subject_name} test tomorrow: ${test.test_name}`,
        priority: 'high'
      });
    });

    // Fees due soon (within 3 days)
    const feesDueSoonRes = await query(`
      SELECT description
      FROM fees
      WHERE due_date <= (CURRENT_DATE + INTERVAL '3 days') AND due_date >= CURRENT_DATE
      AND payment_status = 'Pending'
    `);
    const feesDueSoon = feesDueSoonRes.rows;

    feesDueSoon.forEach(fee => {
      alerts.push({
        type: 'warning',
        message: `Fee due soon: ${fee.description}`,
        priority: 'medium'
      });
    });

    // Low attendance
    const attendanceStatsRes = await query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'Half_Day' THEN 0.5 ELSE 0 END) as half_days
      FROM attendance
      WHERE status IN ('Present', 'Absent', 'Late', 'Half_Day')
    `);
    const attendanceStats = attendanceStatsRes.rows[0];

    const totalDays = parseInt(attendanceStats.total_days) || 0;
    const presentDays = parseFloat(attendanceStats.present_days || 0) + parseFloat(attendanceStats.half_days || 0);
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    if (attendancePercentage < 85 && attendancePercentage > 0) {
      alerts.push({
        type: 'warning',
        message: `Attendance is ${attendancePercentage.toFixed(1)}% (below 85%)`,
        priority: 'medium'
      });
    }

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const activitiesRes = await query(`
      SELECT log_id, action, entity_type, entity_name, created_at
      FROM activity_log
      ORDER BY created_at DESC
      LIMIT 10
    `);
    const activities = activitiesRes.rows;

    res.json(activities);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
