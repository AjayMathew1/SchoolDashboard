import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, TrophyIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/common/Modal';
import { activitiesAPI } from '../../services/api';

export default function ActivitiesList() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [formData, setFormData] = useState({
        activityName: '',
        activityType: 'Sports',
        startDate: '',
        endDate: '',
        hoursPerWeek: '',
        role: '',
        achievementsDescription: '',
        isOngoing: false
    });

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await activitiesAPI.getAll();
            setActivities(response.data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingActivity) {
                await activitiesAPI.update(editingActivity.activity_id, formData);
            } else {
                await activitiesAPI.create(formData);
            }
            fetchActivities();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving activity:', error);
            alert('Failed to save activity');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this activity?')) return;

        try {
            await activitiesAPI.delete(id);
            fetchActivities();
        } catch (error) {
            console.error('Error deleting activity:', error);
            alert('Failed to delete activity');
        }
    };

    const handleEdit = (activity) => {
        setEditingActivity(activity);
        setFormData({
            activityName: activity.activity_name,
            activityType: activity.activity_type,
            startDate: activity.start_date,
            endDate: activity.end_date || '',
            hoursPerWeek: activity.hours_per_week || '',
            role: activity.role || '',
            achievementsDescription: activity.achievements_description || '',
            isOngoing: activity.is_ongoing === 1
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingActivity(null);
        setFormData({
            activityName: '',
            activityType: 'Sports',
            startDate: '',
            endDate: '',
            hoursPerWeek: '',
            role: '',
            achievementsDescription: '',
            isOngoing: false
        });
    };

    const getActivityTypeIcon = (type) => {
        const icons = {
            'Sports': '⚽',
            'Music': '🎵',
            'Art': '🎨',
            'Drama': '🎭',
            'Volunteering': '🤝',
            'Club': '👥',
            'Leadership': '⭐',
            'Other': '📌'
        };
        return icons[type] || icons.Other;
    };

    const getActivityTypeColor = (type) => {
        const colors = {
            'Sports': 'bg-green-100 text-green-800',
            'Music': 'bg-purple-100 text-purple-800',
            'Art': 'bg-pink-100 text-pink-800',
            'Drama': 'bg-red-100 text-red-800',
            'Volunteering': 'bg-blue-100 text-blue-800',
            'Club': 'bg-indigo-100 text-indigo-800',
            'Leadership': 'bg-yellow-100 text-yellow-800',
            'Other': 'bg-gray-100 text-gray-800'
        };
        return colors[type] || colors.Other;
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
                <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    Add Activity
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {activities.length === 0 ? (
                    <div className="card col-span-2">
                        <p className="text-gray-600 text-center py-12">No activities yet. Add your first activity!</p>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.activity_id} className="card">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{getActivityTypeIcon(activity.activity_type)}</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{activity.activity_name}</h3>
                                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getActivityTypeColor(activity.activity_type)}`}>
                                            {activity.activity_type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(activity)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(activity.activity_id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                {activity.role && (
                                    <p><strong>Role:</strong> {activity.role}</p>
                                )}
                                <p>
                                    <strong>Duration:</strong> {new Date(activity.start_date).toLocaleDateString()}
                                    {activity.is_ongoing ? ' - Present' : activity.end_date ? ` - ${new Date(activity.end_date).toLocaleDateString()}` : ''}
                                </p>
                                {activity.hours_per_week && (
                                    <p><strong>Time Commitment:</strong> {activity.hours_per_week} hours/week</p>
                                )}
                                {activity.achievements_description && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-gray-700"><strong>Achievements:</strong></p>
                                        <p className="text-gray-600 mt-1 whitespace-pre-wrap">{activity.achievements_description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingActivity ? 'Edit Activity' : 'Add New Activity'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Activity Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.activityName}
                            onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Activity Type *
                        </label>
                        <select
                            required
                            value={formData.activityType}
                            onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Sports">Sports</option>
                            <option value="Music">Music</option>
                            <option value="Art">Art</option>
                            <option value="Drama">Drama</option>
                            <option value="Volunteering">Volunteering</option>
                            <option value="Club">Club</option>
                            <option value="Leadership">Leadership</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role/Position
                        </label>
                        <input
                            type="text"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Team Captain, Member"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                disabled={formData.isOngoing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.isOngoing}
                                onChange={(e) => setFormData({ ...formData, isOngoing: e.target.checked, endDate: '' })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Ongoing activity</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hours per Week
                        </label>
                        <input
                            type="number"
                            step="0.5"
                            value={formData.hoursPerWeek}
                            onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Achievements & Description
                        </label>
                        <textarea
                            rows="4"
                            value={formData.achievementsDescription}
                            onChange={(e) => setFormData({ ...formData, achievementsDescription: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe your achievements and contributions..."
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
                            {editingActivity ? 'Update' : 'Create'} Activity
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
