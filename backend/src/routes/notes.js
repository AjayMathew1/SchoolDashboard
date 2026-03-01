const express = require('express');
const router = express.Router();
const { query, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all notes
router.get('/', async (req, res) => {
    try {
        const notesRes = await query(`
      SELECT n.*, u.full_name as author_name
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.user_id
      WHERE n.visibility = 'All_Users' OR n.created_by = $1
      ORDER BY n.created_at DESC
    `, [req.user.userId]);

        res.json(notesRes.rows);
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single note
router.get('/:id', async (req, res) => {
    try {
        const noteRes = await query('SELECT * FROM notes WHERE note_id = $1', [req.params.id]);
        const note = noteRes.rows[0];

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Check visibility
        if (note.visibility === 'Private' && note.created_by !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(note);
    } catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create note
router.post('/', async (req, res) => {
    try {
        const {
            linkedModule, linkedEntityId, noteType, title, content, visibility
        } = req.body;

        if (!content || !noteType) {
            return res.status(400).json({ error: 'Content and note type are required' });
        }

        const noteId = generateUUID();

        await query(`
      INSERT INTO notes (
        note_id, linked_module, linked_entity_id, note_type, title,
        content, visibility, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
            noteId, linkedModule, linkedEntityId, noteType, title,
            content, visibility || 'All_Users', req.user.userId
        ]);

        const noteRes = await query('SELECT * FROM notes WHERE note_id = $1', [noteId]);
        const note = noteRes.rows[0];

        res.status(201).json(note);
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update note
router.put('/:id', async (req, res) => {
    try {
        const { title, content, followUpStatus } = req.body;

        // Check ownership
        const noteRes = await query('SELECT * FROM notes WHERE note_id = $1', [req.params.id]);
        const note = noteRes.rows[0];

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (note.created_by !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        await query(`
      UPDATE notes SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        follow_up_status = COALESCE($3, follow_up_status),
        updated_at = CURRENT_TIMESTAMP
      WHERE note_id = $4
    `, [title, content, followUpStatus, req.params.id]);

        const updatedNoteRes = await query('SELECT * FROM notes WHERE note_id = $1', [req.params.id]);
        const updatedNote = updatedNoteRes.rows[0];

        res.json(updatedNote);
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete note
router.delete('/:id', async (req, res) => {
    try {
        const noteRes = await query('SELECT * FROM notes WHERE note_id = $1', [req.params.id]);
        const note = noteRes.rows[0];

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (note.created_by !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        await query('DELETE FROM notes WHERE note_id = $1', [req.params.id]);

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
