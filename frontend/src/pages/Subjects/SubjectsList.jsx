import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Modal from '../../components/common/Modal';
import { subjectsAPI } from '../../services/api';

export default function SubjectsList() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({
        subjectName: '',
        subjectCode: '',
        subjectType: 'Core',
        examBoard: '',
        targetGrade: '',
        colorCode: '#3b82f6',
        description: ''
    });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await subjectsAPI.getAll();
            setSubjects(response.data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSubject) {
                await subjectsAPI.update(editingSubject.subject_id, formData);
            } else {
                await subjectsAPI.create(formData);
            }
            fetchSubjects();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving subject:', error);
            alert('Failed to save subject');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;

        try {
            await subjectsAPI.delete(id);
            fetchSubjects();
        } catch (error) {
            console.error('Error deleting subject:', error);
            alert('Failed to delete subject');
        }
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setFormData({
            subjectName: subject.subject_name,
            subjectCode: subject.subject_code || '',
            subjectType: subject.subject_type,
            examBoard: subject.exam_board || '',
            targetGrade: subject.target_grade || '',
            colorCode: subject.color_code || '#3b82f6',
            description: subject.description || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSubject(null);
        setFormData({
            subjectName: '',
            subjectCode: '',
            subjectType: 'Core',
            examBoard: '',
            targetGrade: '',
            colorCode: '#3b82f6',
            description: ''
        });
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
                <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    Add Subject
                </button>
            </div>

            <div className="card">
                {subjects.length === 0 ? (
                    <p className="text-gray-600 text-center py-12">No subjects yet. Add your first subject!</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Exam Board
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Target Grade
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subjects.map((subject) => (
                                    <tr key={subject.subject_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-3"
                                                    style={{ backgroundColor: subject.color_code }}
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {subject.subject_name}
                                                    </div>
                                                    {subject.subject_code && (
                                                        <div className="text-sm text-gray-500">
                                                            {subject.subject_code}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {subject.subject_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {subject.exam_board || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {subject.target_grade || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(subject)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject.subject_id)}
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
                title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.subjectName}
                            onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Code
                        </label>
                        <input
                            type="text"
                            value={formData.subjectCode}
                            onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Type *
                        </label>
                        <select
                            required
                            value={formData.subjectType}
                            onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Core">Core</option>
                            <option value="Elective">Elective</option>
                            <option value="Additional">Additional</option>
                            <option value="Language">Language</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Exam Board
                        </label>
                        <input
                            type="text"
                            value={formData.examBoard}
                            onChange={(e) => setFormData({ ...formData, examBoard: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Cambridge IGCSE, IB"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target Grade
                        </label>
                        <input
                            type="text"
                            value={formData.targetGrade}
                            onChange={(e) => setFormData({ ...formData, targetGrade: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., A*, 7"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color
                        </label>
                        <input
                            type="color"
                            value={formData.colorCode}
                            onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
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
                            {editingSubject ? 'Update' : 'Create'} Subject
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
