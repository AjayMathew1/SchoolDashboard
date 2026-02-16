import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/common/Modal';
import { assignmentsAPI, subjectsAPI } from '../../services/api';

export default function AssignmentsList() {
    const [assignments, setAssignments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [formData, setFormData] = useState({
        subjectId: '',
        title: '',
        description: '',
        assignmentType: 'Homework',
        assignedDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        dueTime: '',
        priority: 'Medium',
        maxMarks: '',
        weightagePercentage: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assignmentsRes, subjectsRes] = await Promise.all([
                assignmentsAPI.getAll(),
                subjectsAPI.getAll()
            ]);
            setAssignments(assignmentsRes.data);
            setSubjects(subjectsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAssignment) {
                await assignmentsAPI.update(editingAssignment.assignment_id, formData);
            } else {
                await assignmentsAPI.create(formData);
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving assignment:', error);
            alert('Failed to save assignment');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this assignment?')) return;

        try {
            await assignmentsAPI.delete(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting assignment:', error);
            alert('Failed to delete assignment');
        }
    };

    const handleEdit = (assignment) => {
        setEditingAssignment(assignment);
        setFormData({
            subjectId: assignment.subject_id,
            title: assignment.title,
            description: assignment.description || '',
            assignmentType: assignment.assignment_type,
            assignedDate: assignment.assigned_date || new Date().toISOString().split('T')[0],
            dueDate: assignment.due_date,
            dueTime: assignment.due_time || '',
            priority: assignment.priority,
            maxMarks: assignment.max_marks || '',
            weightagePercentage: assignment.weightage_percentage || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAssignment(null);
        setFormData({
            subjectId: '',
            title: '',
            description: '',
            assignmentType: 'Homework',
            assignedDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            dueTime: '',
            priority: 'Medium',
            maxMarks: '',
            weightagePercentage: ''
        });
    };

    const filteredAssignments = filterStatus === 'all'
        ? assignments
        : assignments.filter(a => a.status === filterStatus);

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'In_Progress': 'bg-blue-100 text-blue-800',
            'Submitted': 'bg-green-100 text-green-800',
            'Graded': 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'High': 'text-red-600',
            'Medium': 'text-yellow-600',
            'Low': 'text-green-600'
        };
        return colors[priority] || 'text-gray-600';
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
                <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    Add Assignment
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2">
                {['all', 'Pending', 'In_Progress', 'Submitted', 'Graded'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-md transition-colors ${filterStatus === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <div className="card">
                {filteredAssignments.length === 0 ? (
                    <p className="text-gray-600 text-center py-12">
                        {filterStatus === 'all' ? 'No assignments yet. Add your first assignment!' : `No ${filterStatus.replace('_', ' ').toLowerCase()} assignments.`}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assignment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAssignments.map((assignment) => (
                                    <tr key={assignment.assignment_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {assignment.title}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {assignment.assignment_type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {assignment.color_code && (
                                                    <div
                                                        className="w-3 h-3 rounded-full mr-2"
                                                        style={{ backgroundColor: assignment.color_code }}
                                                    />
                                                )}
                                                <span className="text-sm text-gray-900">{assignment.subject_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(assignment.due_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-medium ${getPriorityColor(assignment.priority)}`}>
                                                {assignment.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                                                {assignment.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(assignment)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(assignment.assignment_id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject *
                        </label>
                        <select
                            required
                            value={formData.subjectId}
                            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a subject</option>
                            {subjects.map(subject => (
                                <option key={subject.subject_id} value={subject.subject_id}>
                                    {subject.subject_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type *
                            </label>
                            <select
                                required
                                value={formData.assignmentType}
                                onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Homework">Homework</option>
                                <option value="Project">Project</option>
                                <option value="Essay">Essay</option>
                                <option value="Presentation">Presentation</option>
                                <option value="Lab_Report">Lab Report</option>
                                <option value="Research">Research</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Time
                            </label>
                            <input
                                type="time"
                                value={formData.dueTime}
                                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Marks
                            </label>
                            <input
                                type="number"
                                value={formData.maxMarks}
                                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Weightage %
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.weightagePercentage}
                                onChange={(e) => setFormData({ ...formData, weightagePercentage: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
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
                            {editingAssignment ? 'Update' : 'Create'} Assignment
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
