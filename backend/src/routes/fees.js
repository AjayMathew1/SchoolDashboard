const express = require('express');
const router = express.Router();
const { db, generateUUID } = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// Get all fees
router.get('/', (req, res) => {
    try {
        const { status } = req.query;

        let query = 'SELECT * FROM fees WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND payment_status = ?';
            params.push(status);
        }

        query += ' ORDER BY due_date DESC';

        const fees = db.prepare(query).all(...params);

        res.json(fees);
    } catch (error) {
        console.error('Get fees error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get fee summary
router.get('/summary', (req, res) => {
    try {
        const summary = db.prepare(`
      SELECT 
        SUM(amount) as total_fees,
        SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN payment_status = 'Pending' OR payment_status = 'Overdue' THEN amount ELSE 0 END) as total_pending
      FROM fees
    `).get();

        res.json(summary);
    } catch (error) {
        console.error('Get fee summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single fee
router.get('/:id', (req, res) => {
    try {
        const fee = db.prepare('SELECT * FROM fees WHERE fee_id = ?').get(req.params.id);

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
router.post('/', requireRole('admin'), (req, res) => {
    try {
        const {
            feeCategory, description, amount, dueDate, academicTerm
        } = req.body;

        if (!feeCategory || !description || !amount) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const feeId = generateUUID();

        const stmt = db.prepare(`
      INSERT INTO fees (
        fee_id, fee_category, description, amount, due_date, academic_term, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(feeId, feeCategory, description, amount, dueDate, academicTerm, req.user.userId);

        const fee = db.prepare('SELECT * FROM fees WHERE fee_id = ?').get(feeId);

        res.status(201).json(fee);
    } catch (error) {
        console.error('Create fee error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update fee (mark as paid, etc.)
router.put('/:id', requireRole('admin'), (req, res) => {
    try {
        const {
            paymentStatus, paymentDate, paidBy, paymentMode,
            transactionReference, receiptNumber, personalNotes
        } = req.body;

        const stmt = db.prepare(`
      UPDATE fees SET
        payment_status = COALESCE(?, payment_status),
        payment_date = COALESCE(?, payment_date),
        paid_by = COALESCE(?, paid_by),
        payment_mode = COALESCE(?, payment_mode),
        transaction_reference = COALESCE(?, transaction_reference),
        receipt_number = COALESCE(?, receipt_number),
        personal_notes = COALESCE(?, personal_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE fee_id = ?
    `);

        const result = stmt.run(
            paymentStatus, paymentDate, paidBy, paymentMode,
            transactionReference, receiptNumber, personalNotes, req.params.id
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        const fee = db.prepare('SELECT * FROM fees WHERE fee_id = ?').get(req.params.id);

        res.json(fee);
    } catch (error) {
        console.error('Update fee error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete fee
router.delete('/:id', requireRole('admin'), (req, res) => {
    try {
        const result = db.prepare('DELETE FROM fees WHERE fee_id = ?').run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        res.json({ message: 'Fee deleted successfully' });
    } catch (error) {
        console.error('Delete fee error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
