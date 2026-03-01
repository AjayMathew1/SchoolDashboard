const express = require('express');
const router = express.Router();
const { query, generateUUID } = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// Get all fees
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;

        let sqlQuery = 'SELECT * FROM fees WHERE 1=1';
        const params = [];

        if (status) {
            params.push(status);
            sqlQuery += ` AND payment_status = $${params.length}`;
        }

        sqlQuery += ' ORDER BY due_date DESC';

        const feesRes = await query(sqlQuery, params);
        const fees = feesRes.rows;

        res.json(fees);
    } catch (error) {
        console.error('Get fees error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get fee summary
router.get('/summary', async (req, res) => {
    try {
        const summaryRes = await query(`
      SELECT 
        SUM(amount) as total_fees,
        SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN payment_status = 'Pending' OR payment_status = 'Overdue' THEN amount ELSE 0 END) as total_pending
      FROM fees
    `);
        const summary = summaryRes.rows[0];

        res.json(summary);
    } catch (error) {
        console.error('Get fee summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single fee
router.get('/:id', async (req, res) => {
    try {
        const feeRes = await query('SELECT * FROM fees WHERE fee_id = $1', [req.params.id]);
        const fee = feeRes.rows[0];

        if (!fee) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        res.json(fee);
    } catch (error) {
        console.error('Get fee error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create fee
router.post('/', requireRole('admin'), async (req, res) => {
    try {
        const {
            feeCategory, description, amount, dueDate, academicTerm
        } = req.body;

        if (!feeCategory || !description || !amount) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const feeId = generateUUID();

        await query(`
      INSERT INTO fees (
        fee_id, fee_category, description, amount, due_date, academic_term, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [feeId, feeCategory, description, amount, dueDate, academicTerm, req.user.userId]);

        const feeRes = await query('SELECT * FROM fees WHERE fee_id = $1', [feeId]);
        const fee = feeRes.rows[0];

        res.status(201).json(fee);
    } catch (error) {
        console.error('Create fee error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update fee (mark as paid, etc.)
router.put('/:id', requireRole('admin'), async (req, res) => {
    try {
        const {
            paymentStatus, paymentDate, paidBy, paymentMode,
            transactionReference, receiptNumber, personalNotes
        } = req.body;

        const result = await query(`
      UPDATE fees SET
        payment_status = COALESCE($1, payment_status),
        payment_date = COALESCE($2, payment_date),
        paid_by = COALESCE($3, paid_by),
        payment_mode = COALESCE($4, payment_mode),
        transaction_reference = COALESCE($5, transaction_reference),
        receipt_number = COALESCE($6, receipt_number),
        personal_notes = COALESCE($7, personal_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE fee_id = $8
    `, [
            paymentStatus, paymentDate, paidBy, paymentMode,
            transactionReference, receiptNumber, personalNotes, req.params.id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        const feeRes = await query('SELECT * FROM fees WHERE fee_id = $1', [req.params.id]);
        const fee = feeRes.rows[0];

        res.json(fee);
    } catch (error) {
        console.error('Update fee error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete fee
router.delete('/:id', requireRole('admin'), async (req, res) => {
    try {
        const result = await query('DELETE FROM fees WHERE fee_id = $1', [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        res.json({ message: 'Fee deleted successfully' });
    } catch (error) {
        console.error('Delete fee error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
