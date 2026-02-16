const express = require('express');
const router = express.Router();
const { db, generateUUID } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get all notes
router.get('/', (req, res) => {
    try {
        const notes = db.prepare(`
      SELECT n.*, u.full_name as author_name
      FROM notes n
      LEFT JOIN users u ON n.created_by = u.user_id
      WHERE n.visibility = 'All_Users' OR n.created_by = ?
      ORDER BY n.created_at DESC
    `).all(req.user.userId);

        res.json(notes);
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single note
router.get('/:id', (req, res) => {
    try {
        const note = db.prepare('SELECT * FROM notes WHERE note_id = ?').get(req.params.id);

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
router.post('/', (req, res) => {
    try {
        const {
            linkedModule, linkedEntityId, noteType, title, content, visibility
        } = req.body;

        if (!content || !noteType) {
            return res.status(400).json({ error: 'Content and note type are required' });
        }

        const noteId = generateUUID();

        const stmt = db.prepare(`
      INSERT INTO notes (
        note_id, linked_module, linked_entity_id, note_type, title,
        content, visibility, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            noteId, linkedModule, linkedEntityId, noteType, title,
            content, visibility || 'All_Users', req.user.userId
        );

        const note = db.prepare('SELECT * FROM notes WHERE note_id = ?').get(noteId);

        res.status(201).json(note);
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update note
router.put('/:id', (req, res) => {
    try {
        const { title, content, followUpStatus } = req.body;

        // Check ownership
        const note = db.prepare('SELECT * FROM notes WHERE note_id = ?').get(req.params.id);

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (note.created_by !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const stmt = db.prepare(`
      UPDATE notes SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        follow_up_status = COALESCE(?, follow_up_status),
        updated_at = CURRENT_TIMESTAMP
      WHERE note_id = ?
    `);

        stmt.run(title, content, followUpStatus, req.params.id);

        const updatedNote = db.prepare('SELECT * FROM notes WHERE note_id = ?').get(req.params.id);

        res.json(updatedNote);
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete note
router.delete('/:id', (req, res) => {
    try {
        const note = db.prepare('SELECT * FROM notes WHERE note_id = ?').get(req.params.id);

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (note.created_by !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        db.prepare('DELETE FROM notes WHERE note_id = ?').run(req.params.id);

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
