import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, TrophyIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/common/Modal';
import { awardsAPI } from '../../services/api';

export default function AwardsList() {
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAward, setEditingAward] = useState(null);
    const [formData, setFormData] = useState({
        awardName: '',
        awardType: 'Academic',
        awardedBy: '',
        awardDate: '',
        awardLevel: 'School',
        description: ''
    });

    useEffect(() => {
        fetchAwards();
    }, []);

    const fetchAwards = async () => {
        try {
            const response = await awardsAPI.getAll();
            setAwards(response.data);
        } catch (error) {
            console.error('Error fetching awards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAward) {
                await awardsAPI.update(editingAward.award_id, formData);
            } else {
                await awardsAPI.create(formData);
            }
            fetchAwards();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving award:', error);
            alert('Failed to save award');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this award?')) return;

        try {
            await awardsAPI.delete(id);
            fetchAwards();
        } catch (error) {
            console.error('Error deleting award:', error);
            alert('Failed to delete award');
        }
    };

    const handleEdit = (award) => {
        setEditingAward(award);
        setFormData({
            awardName: award.award_name,
            awardType: award.award_type,
            awardedBy: award.awarded_by || '',
            awardDate: award.award_date,
            awardLevel: award.award_level,
            description: award.description || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAward(null);
        setFormData({
            awardName: '',
            awardType: 'Academic',
            awardedBy: '',
            awardDate: '',
            awardLevel: 'School',
            description: ''
        });
    };

    const getAwardIcon = (type) => {
        const icons = {
            'Academic': '🎓',
            'Sports': '🏆',
            'Arts': '🎨',
            'Leadership': '⭐',
            'Service': '🤝',
            'Participation': '🎯',
            'Other': '🏅'
        };
        return icons[type] || icons.Other;
    };

    const getAwardLevelColor = (level) => {
        const colors = {
            'International': 'bg-purple-100 text-purple-800 border-purple-300',
            'National': 'bg-blue-100 text-blue-800 border-blue-300',
            'State': 'bg-green-100 text-green-800 border-green-300',
            'District': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'School': 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return colors[level] || colors.School;
    };

    const getAwardTypeColor = (type) => {
        const colors = {
            'Academic': 'bg-blue-100 text-blue-800',
            'Sports': 'bg-green-100 text-green-800',
            'Arts': 'bg-pink-100 text-pink-800',
            'Leadership': 'bg-yellow-100 text-yellow-800',
            'Service': 'bg-purple-100 text-purple-800',
            'Participation': 'bg-indigo-100 text-indigo-800',
            'Other': 'bg-gray-100 text-gray-800'
        };
        return colors[type] || colors.Other;
    };

    // Group awards by year
    const groupedAwards = awards.reduce((acc, award) => {
        const year = new Date(award.award_date).getFullYear();
        if (!acc[year]) acc[year] = [];
        acc[year].push(award);
        return acc;
    }, {});

    const sortedYears = Object.keys(groupedAwards).sort((a, b) => b - a);

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
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Awards & Achievements</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Total: {awards.length} {awards.length === 1 ? 'award' : 'awards'}
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    Add Award
                </button>
            </div>

            {awards.length === 0 ? (
                <div className="card">
                    <p className="text-gray-600 text-center py-12">No awards yet. Add your first achievement!</p>
                </div>
            ) : (
                sortedYears.map(year => (
                    <div key={year} className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{year}</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {groupedAwards[year].map((award) => (
                                <div
                                    key={award.award_id}
                                    className={`card border-2 ${getAwardLevelColor(award.award_level)} hover:shadow-lg transition-shadow`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="text-4xl">{getAwardIcon(award.award_type)}</div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(award)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(award.award_id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {award.award_name}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAwardTypeColor(award.award_type)}`}>
                                            {award.award_type}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAwardLevelColor(award.award_level)}`}>
                                            {award.award_level}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-sm text-gray-600">
                                        {award.awarded_by && (
                                            <p><strong>Awarded by:</strong> {award.awarded_by}</p>
                                        )}
                                        <p><strong>Date:</strong> {new Date(award.award_date).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}</p>
                                        {award.description && (
                                            <p className="mt-2 text-gray-700">{award.description}</p>
                                        )}
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
                title={editingAward ? 'Edit Award' : 'Add Award'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Award Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.awardName}
                            onChange={(e) => setFormData({ ...formData, awardName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., First Place in Science Fair"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Award Type *
                            </label>
                            <select
                                required
                                value={formData.awardType}
                                onChange={(e) => setFormData({ ...formData, awardType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Academic">Academic</option>
                                <option value="Sports">Sports</option>
                                <option value="Arts">Arts</option>
                                <option value="Leadership">Leadership</option>
                                <option value="Service">Service</option>
                                <option value="Participation">Participation</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Level *
                            </label>
                            <select
                                required
                                value={formData.awardLevel}
                                onChange={(e) => setFormData({ ...formData, awardLevel: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="School">School</option>
                                <option value="District">District</option>
                                <option value="State">State</option>
                                <option value="National">National</option>
                                <option value="International">International</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Awarded By
                        </label>
                        <input
                            type="text"
                            value={formData.awardedBy}
                            onChange={(e) => setFormData({ ...formData, awardedBy: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Principal, Organization Name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Award Date *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.awardDate}
                            onChange={(e) => setFormData({ ...formData, awardDate: e.target.value })}
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
                            placeholder="Details about the award or achievement..."
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
                            {editingAward ? 'Update' : 'Add'} Award
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
