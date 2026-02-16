import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/common/Modal';
import { notesAPI } from '../../services/api';

export default function NotesList() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        noteType: 'General',
        visibility: 'All_Users',
        linkedModule: 'General',
        linkedEntityId: ''
    });

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await notesAPI.getAll();
            setNotes(response.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNote) {
                await notesAPI.update(editingNote.note_id, formData);
            } else {
                await notesAPI.create(formData);
            }
            fetchNotes();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save note');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            await notesAPI.delete(id);
            fetchNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note');
        }
    };

    const handleEdit = (note) => {
        setEditingNote(note);
        setFormData({
            title: note.title || '',
            content: note.content,
            noteType: note.note_type,
            visibility: note.visibility,
            linkedModule: note.linked_module || 'General',
            linkedEntityId: note.linked_entity_id || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingNote(null);
        setFormData({
            title: '',
            content: '',
            noteType: 'General',
            visibility: 'All_Users',
            linkedModule: 'General',
            linkedEntityId: ''
        });
    };

    const getNoteTypeColor = (type) => {
        const colors = {
            'Observation': 'bg-blue-100 text-blue-800',
            'Concern': 'bg-red-100 text-red-800',
            'Achievement': 'bg-green-100 text-green-800',
            'Follow_Up': 'bg-yellow-100 text-yellow-800',
            'Reminder': 'bg-purple-100 text-purple-800',
            'General': 'bg-gray-100 text-gray-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    Add Note
                </button>
            </div>

            <div className="grid gap-4">
                {notes.length === 0 ? (
                    <div className="card">
                        <p className="text-gray-600 text-center py-12">No notes yet. Add your first note!</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div key={note.note_id} className="card">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getNoteTypeColor(note.note_type)}`}>
                                            {note.note_type.replace('_', ' ')}
                                        </span>
                                        <span className="flex items-center text-sm text-gray-500">
                                            {note.visibility === 'Private' ? (
                                                <>
                                                    <EyeSlashIcon className="w-4 h-4 mr-1" />
                                                    Private
                                                </>
                                            ) : (
                                                <>
                                                    <EyeIcon className="w-4 h-4 mr-1" />
                                                    Shared
                                                </>
                                            )}
                                        </span>
                                        {note.linked_module && note.linked_module !== 'General' && (
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {note.linked_module}
                                            </span>
                                        )}
                                    </div>
                                    {note.title && (
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                                    )}
                                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(note.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleEdit(note)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(note.note_id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingNote ? 'Edit Note' : 'Add New Note'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add a title..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content *
                        </label>
                        <textarea
                            required
                            rows="6"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Write your note..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type *
                            </label>
                            <select
                                required
                                value={formData.noteType}
                                onChange={(e) => setFormData({ ...formData, noteType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="General">General</option>
                                <option value="Observation">Observation</option>
                                <option value="Concern">Concern</option>
                                <option value="Achievement">Achievement</option>
                                <option value="Follow_Up">Follow Up</option>
                                <option value="Reminder">Reminder</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Visibility
                            </label>
                            <select
                                value={formData.visibility}
                                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All_Users">Shared</option>
                                <option value="Private">Private</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Related To
                        </label>
                        <select
                            value={formData.linkedModule}
                            onChange={(e) => setFormData({ ...formData, linkedModule: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="General">General</option>
                            <option value="Subject">Subject</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Test">Test</option>
                            <option value="Event">Event</option>
                            <option value="Award">Award</option>
                            <option value="Activity">Activity</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            {editingNote ? 'Update' : 'Create'} Note
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
