import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/common/Modal';
import { eventsAPI } from '../../services/api';

export default function EventsList() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        eventName: '',
        eventType: 'Academic',
        eventDate: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        isAllDay: false
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await eventsAPI.getAll();
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                await eventsAPI.update(editingEvent.event_id, formData);
            } else {
                await eventsAPI.create(formData);
            }
            fetchEvents();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Failed to save event');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await eventsAPI.delete(id);
            fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            eventName: event.event_name,
            eventType: event.event_type,
            eventDate: event.event_date,
            startTime: event.start_time || '',
            endTime: event.end_time || '',
            location: event.location || '',
            description: event.description || '',
            isAllDay: event.is_all_day === 1
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
        setFormData({
            eventName: '',
            eventType: 'Academic',
            eventDate: '',
            startTime: '',
            endTime: '',
            location: '',
            description: '',
            isAllDay: false
        });
    };

    const getEventTypeColor = (type) => {
        const colors = {
            'Academic': 'bg-blue-100 text-blue-800 border-blue-300',
            'Sports': 'bg-green-100 text-green-800 border-green-300',
            'Cultural': 'bg-purple-100 text-purple-800 border-purple-300',
            'Exam': 'bg-red-100 text-red-800 border-red-300',
            'Holiday': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Meeting': 'bg-gray-100 text-gray-800 border-gray-300',
            'Other': 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return colors[type] || colors.Other;
    };

    // Group events by month
    const groupedEvents = events.reduce((acc, event) => {
        const date = new Date(event.event_date);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!acc[monthYear]) acc[monthYear] = [];
        acc[monthYear].push(event);
        return acc;
    }, {});

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
                <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    Add Event
                </button>
            </div>

            {events.length === 0 ? (
                <div className="card">
                    <p className="text-gray-600 text-center py-12">No events yet. Add your first event!</p>
                </div>
            ) : (
                Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
                    <div key={monthYear} className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">{monthYear}</h2>
                        <div className="space-y-3">
                            {monthEvents.map((event) => (
                                <div key={event.event_id} className={`card border-l-4 ${getEventTypeColor(event.event_type)}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex items-center text-gray-600">
                                                    <CalendarIcon className="w-5 h-5 mr-2" />
                                                    <span className="font-medium">
                                                        {new Date(event.event_date).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                {!event.is_all_day && event.start_time && (
                                                    <span className="text-sm text-gray-500">
                                                        {event.start_time}
                                                        {event.end_time && ` - ${event.end_time}`}
                                                    </span>
                                                )}
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.event_type)}`}>
                                                    {event.event_type}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.event_name}</h3>
                                            {event.location && (
                                                <p className="text-sm text-gray-600 mb-1">📍 {event.location}</p>
                                            )}
                                            {event.description && (
                                                <p className="text-gray-700 mt-2">{event.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEdit(event)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.event_id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingEvent ? 'Edit Event' : 'Add New Event'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.eventName}
                            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Type *
                        </label>
                        <select
                            required
                            value={formData.eventType}
                            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Academic">Academic</option>
                            <option value="Sports">Sports</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Exam">Exam</option>
                            <option value="Holiday">Holiday</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Date *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.eventDate}
                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isAllDay}
                                onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">All day event</span>
                        </label>
                    </div>

                    {!formData.isAllDay && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                            {editingEvent ? 'Update' : 'Create'} Event
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
